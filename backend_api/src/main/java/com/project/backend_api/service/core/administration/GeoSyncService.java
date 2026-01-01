package com.project.backend_api.service.core.administration;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.backend_api.model.core.administration.Country;
import com.project.backend_api.model.core.administration.City;
import com.project.backend_api.model.core.administration.State;
import com.project.backend_api.model.core.administration.Currency;
import com.project.backend_api.repository.core.administration.CityRepository;
import com.project.backend_api.repository.core.administration.CountryRepository;
import com.project.backend_api.repository.core.administration.CurrencyRepository;
import com.project.backend_api.repository.core.administration.StateRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.ArrayList;
import java.util.UUID;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeoSyncService {

    private final CountryRepository countryRepository;
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;
    private final CurrencyRepository currencyRepository;
    private final ObjectMapper objectMapper;

    // Source: https://github.com/dr5hn/countries-states-cities-database
    private static final String DATA_URL = "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries+states+cities.json";

    @Transactional
    public SyncResult syncLocations() {
        long startTime = System.currentTimeMillis();
        SyncResult result = new SyncResult();

        try {
            log.info("Starting location synchronization from {}", DATA_URL);
            // Download and parse JSON from GitHub
            ExternalCountry[] externalCountries = objectMapper.readValue(URI.create(DATA_URL).toURL(),
                    ExternalCountry[].class);
            log.info("Downloaded {} countries. Processing...", externalCountries.length);

            // Nuclear Optimization: Pre-load EVERYTHING to avoid any N+1 query
            log.info("Pre-loading existing data...");
            Map<String, Country> existingCountries = countryRepository.findAll().stream()
                    .collect(Collectors.toMap(c -> c.getCode().toUpperCase(), c -> c));

            Map<String, Currency> existingCurrencies = currencyRepository.findAll().stream()
                    .collect(Collectors.toMap(Currency::getCode, c -> c));

            Map<UUID, Map<String, State>> statesByCountry = stateRepository.findAll().stream()
                    .collect(Collectors.groupingBy(s -> s.getCountry().getId(),
                            Collectors.toMap(s -> s.getName().toUpperCase(), s -> s, (s1, s2) -> s1)));

            log.debug("Pre-loading cities (this may take a few seconds)...");
            Map<UUID, Set<String>> citiesByState = cityRepository.findAll().stream()
                    .collect(Collectors.groupingBy(c -> c.getState().getId(),
                            Collectors.mapping(c -> c.getName().toUpperCase(), Collectors.toSet())));
            log.debug("Pre-loading completed.");

            for (ExternalCountry extCountry : externalCountries) {
                processCountry(extCountry, existingCountries, statesByCountry, citiesByState, existingCurrencies,
                        result);
            }

            long duration = System.currentTimeMillis() - startTime;
            result.setDurationMs(duration);
            log.debug(
                    "Synchronization completed in {} ms. Added: {} countries, {} updated, {} currencies, {} states, {} cities, {} phone codes.",
                    duration, result.countriesAdded, result.countriesUpdated, result.currenciesAdded,
                    result.statesAdded, result.citiesAdded,
                    result.phoneCodesSynced);

        } catch (Exception e) {
            log.error("Error syncing locations", e);
            result.setError(e.getMessage());
        }

        return result;
    }

    private void processCountry(ExternalCountry extCountry, Map<String, Country> existingCountries,
            Map<UUID, Map<String, State>> statesByCountry,
            Map<UUID, Set<String>> citiesByState,
            Map<String, Currency> existingCurrencies, SyncResult result) {
        String iso2 = extCountry.getIso2();
        if (iso2 == null) {
            log.debug("Skipping country {} - ISO2 is null", extCountry.getName());
            return;
        }

        Country country = existingCountries.get(iso2.toUpperCase());

        // Robust phone code extraction
        String formattedPhone = (extCountry.getPhoneCode() != null && !extCountry.getPhoneCode().trim().isEmpty()
                && !extCountry.getPhoneCode().startsWith("+"))
                        ? "+" + extCountry.getPhoneCode().trim()
                        : (extCountry.getPhoneCode() != null && !extCountry.getPhoneCode().trim().isEmpty()
                                ? extCountry.getPhoneCode().trim()
                                : null);

        if (country == null) {
            country = Country.builder()
                    .name(extCountry.getName())
                    .code(extCountry.getIso2())
                    .phoneCode(formattedPhone)
                    .active(true)
                    .build();
            country = countryRepository.save(country);
            existingCountries.put(country.getCode().toUpperCase(), country);
            result.countriesAdded++;
            if (formattedPhone != null) {
                result.phoneCodesSynced++;
            }
        } else {
            boolean updated = false;
            if (!Objects.equals(country.getName(), extCountry.getName())) {
                country.setName(extCountry.getName());
                updated = true;
            }

            if (formattedPhone != null && !formattedPhone.equals(country.getPhoneCode())) {
                log.debug("Updating phone code for {}: '{}' -> '{}'", country.getName(), country.getPhoneCode(),
                        formattedPhone);
                country.setPhoneCode(formattedPhone);
                updated = true;
                result.phoneCodesSynced++;
            }

            if (updated) {
                countryRepository.save(country);
                result.countriesUpdated++;
            }
        }

        if (extCountry.getStates() != null && !extCountry.getStates().isEmpty()) {
            processStates(country, extCountry.getStates(), statesByCountry, citiesByState, result);
        }

        processCurrency(extCountry, existingCurrencies, result);
    }

    private void processCurrency(ExternalCountry extCountry, Map<String, Currency> existingCurrencies,
            SyncResult result) {
        if (extCountry.getCurrency() != null && extCountry.getCurrencyName() != null) {
            String code = extCountry.getCurrency();

            if (!existingCurrencies.containsKey(code)) {
                Currency currency = Currency.builder()
                        .code(code)
                        .name(extCountry.getCurrencyName())
                        .symbol(extCountry.getCurrencySymbol())
                        .nativeSymbol(extCountry.getCurrencySymbolNative())
                        .build();
                try {
                    currency = currencyRepository.save(currency);
                    existingCurrencies.put(code, currency);
                    result.currenciesAdded++;
                } catch (Exception e) {
                    log.warn("Could not save currency {}: {}", code, e.getMessage());
                }
            }
        }
    }

    private void processStates(Country country, List<ExternalState> extStates,
            Map<UUID, Map<String, State>> statesByCountry,
            Map<UUID, Set<String>> citiesByState, SyncResult result) {
        Map<String, State> existingStates = statesByCountry.computeIfAbsent(country.getId(), k -> new HashMap<>());

        for (ExternalState extState : extStates) {
            String stateNameUpper = extState.getName().toUpperCase();
            State state = existingStates.get(stateNameUpper);

            if (state == null) {
                state = State.builder()
                        .country(country)
                        .name(extState.getName())
                        .code(extState.getStateCode())
                        .active(true)
                        .build();
                try {
                    state = stateRepository.save(state);
                    existingStates.put(stateNameUpper, state);
                    result.statesAdded++;
                } catch (Exception e) {
                    log.warn("Could not save state {}: {}", extState.getName(), e.getMessage());
                    continue;
                }
            }

            if (extState.getCities() != null && !extState.getCities().isEmpty()) {
                processCities(state, extState.getCities(), citiesByState, result);
            }
        }
    }

    private void processCities(State state, List<ExternalCity> extCities,
            Map<UUID, Set<String>> citiesByState, SyncResult result) {
        Set<String> existingCityNames = citiesByState.getOrDefault(state.getId(), new HashSet<>());

        List<City> citiesToSave = new ArrayList<>();
        for (ExternalCity extCity : extCities) {
            if (extCity.getName() == null)
                continue;
            String cityNameUpper = extCity.getName().toUpperCase();
            if (!existingCityNames.contains(cityNameUpper)) {
                citiesToSave.add(City.builder()
                        .state(state)
                        .name(extCity.getName())
                        .active(true)
                        .build());
                existingCityNames.add(cityNameUpper);
                result.citiesAdded++;
            }
        }

        if (!citiesToSave.isEmpty()) {
            try {
                cityRepository.saveAll(citiesToSave);
            } catch (Exception e) {
                log.warn("Could not save cities batch for state {}: {}", state.getName(), e.getMessage());
            }
        }
    }

    @Data
    public static class SyncResult {
        private int countriesAdded = 0;
        private int countriesUpdated = 0;
        private int currenciesAdded = 0;
        private int statesAdded = 0;
        private int citiesAdded = 0;
        private int phoneCodesSynced = 0;
        private long durationMs = 0;
        private String error;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExternalCountry {
        @JsonProperty("name")
        private String name;

        @JsonProperty("iso2")
        private String iso2;

        @JsonProperty("phone_code")
        @JsonAlias({ "phone_code", "phonecode", "phoneCode" })
        private String phoneCode;

        @JsonProperty("currency")
        private String currency;

        @JsonProperty("currency_name")
        private String currencyName;

        @JsonProperty("currency_symbol")
        private String currencySymbol;

        @JsonProperty("currency_symbol_native")
        private String currencySymbolNative;

        @JsonProperty("states")
        private List<ExternalState> states;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExternalState {
        @JsonProperty("name")
        private String name;
        @JsonProperty("state_code")
        private String stateCode;
        @JsonProperty("cities")
        private List<ExternalCity> cities;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExternalCity {
        @JsonProperty("name")
        private String name;
    }
}
