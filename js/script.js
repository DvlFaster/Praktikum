var attributes = {
    topLevelDomain: 'Top Level Domain',
    alpha2Code: 'Alpha-2-Code',
    alpha3Code: 'Alpha-3-Code',
    callingCodes: 'Calling Codes',
    capital: 'Capital',
    altSpellings: 'Alternative Spellings',
    region: 'Region',
    subregion: 'Sub-Region',
    population: 'Population',
    latlng: 'Latitude & Longitude',
    demonym: 'Demonym',
    area: 'Area',
    gini: 'Gini',
    timezones: 'Timezones',
    borders: 'Borders',
    nativeName: 'Native Name',
    numericCode: 'Numeric Code',
    currencies: 'Currencies',
    languages: 'Languages',
    flag: 'Flag',
    regionalBlocs: 'Regional Blocs'
};

var requiredFields = ['name'];
var skipAttributes = ['name', 'flag', 'nativeName', 'translations'];

var countryResults = [];

var getSelectedView = function() {
    return $('input[name="viewRadio"]:checked').val();
};

var displayAttributesCheck = function() {
    for (var attribute in attributes) {
        if (attributes.hasOwnProperty(attribute)) {
            $('#attributesCheck').append($('<div></div>', {
                class: 'custom-control custom-checkbox custom-control-inline',
                html: [
                    $('<input>', {
                        name: attribute,
                        type: 'checkbox',
                        class: 'custom-control-input filterAttributesCheck',
                        id: attribute + 'Check',
                        checked: true
                    }),
                    $('<label></label>', {
                        class: 'custom-control-label',
                        for: attribute + 'Check',
                        html: attributes[attribute]
                    })
                ]
            }));
        }
    }
};

var getCountryCard = function (country, selectedView) {

    var card = $('<div></div>', {
        class: 'card h-100 shadow-sm'
    });

    var cardBody = $('<div></div>', {
        class: 'card-body'
    });

    if (selectedView == 'vertical') {

        if (country.hasOwnProperty('flag')) {
            card.append($('<img>', {
                src: country.flag,
                class: 'card-img-top border-bottom img-thumbnail',
                alt: 'Flag image'
            }));
        }

        cardBody.append($('<h5></h5>', {
            class: 'card-title',
            html: country.name
        }));

        if (country.hasOwnProperty('nativeName')) {
            cardBody.append($('<h6></h6>', {
                class: 'card-subtitle mb-2 text-muted',
                html: country.nativeName
            }));
        }

        cardBody.append(getCountryAttributeList(country));

        card.append(cardBody);
    } else if (selectedView == 'horizontal') {

        var hasIcon = false;

        var row = $('<div></div>', {
            class: 'row no-gutters',
        });

        if (country.hasOwnProperty('flag')) {
            var hasIcon = true;
            row.append($('<div></div>', {
                class: 'col-md-4',
                html: $('<img>', {
                    src: country.flag,
                    class: 'card-img-top border-bottom img-thumbnail',
                    alt: 'Flag image'
                })
            }));
        }

        if (hasIcon) {
            var infoColumnClass = 'col-md-8';
        } else {
            var infoColumnClass = 'col-md-12';
        }

        var infoColumn = $('<div></div>', {class: infoColumnClass})

        cardBody.append($('<h5></h5>', {
            class: 'card-title',
            html: country.name
        }));

        if (country.hasOwnProperty('nativeName')) {
            cardBody.append($('<h6></h6>', {
                class: 'card-subtitle mb-2 text-muted',
                html: country.nativeName
            }));
        }

        cardBody.append(getCountryAttributeList(country));
        infoColumn.append(cardBody);
        row.append(infoColumn);
        card.append(row);
    }

    return card;
};

var getCountryAttributeList = function(country) {

    var list = $('<ul></ul>', {
        class: 'list-unstyled',
    });

    for (var attribute in country) {
        if (skipAttributes.indexOf(attribute) == -1) {
            list.append(getListElement(attributes[attribute], attribute, country[attribute]));
        }
    }

    return list;
};

var getListElement = function(title, key, value) {
    var htmlValue;

    if (value == null || value == '' || (Array.isArray(value) && value.length == 0)) {
        htmlValue = '-';
    } else {
        if (key == 'currencies') {
            var currencies = [];
            value.forEach(function(currency) {
                if (currency.hasOwnProperty('name')) {
                    currencies.push(
                        currency.name + ' (' + currency.code + ')'
                    );
                } else {
                    currencies.push(currency.code);
                }
            });
            htmlValue = currencies.join(', ');
        } else if (key == 'regionalBlocs') {
            var regionalBlocs = [];
            value.forEach(function(regionalBloc) {
                regionalBlocs.push(
                    regionalBloc.name + ' (' + regionalBloc.acronym + ')'
                );
            });
            htmlValue = regionalBlocs.join(', ');
        } else if (key == 'languages') {
            var languages = [];
            value.forEach(function(language) {
                languages.push(language.name);
            });
            htmlValue = languages.join(', ');
        } else {
            htmlValue = Array.isArray(value) ? value.join(', ') : value
        }
    }

    return $('<li></li>', {
        html: [
            $('<strong></strong>', {html: title + ':', class: 'mr-1'}),
            htmlValue
        ]
    });
};

var getFilterFields = function() {
    var filterFields = [];

    $('.filterAttributesCheck').each(function(indexInput, filterInput) {
        var $filterInput = $(filterInput);

        if ($filterInput.is(':checked')) {
            filterFields.push($filterInput.attr('name'));
        }
    });

    requiredFields.forEach(function(requiredField) {
        filterFields.push(requiredField);
    });

    return filterFields;
};

var executeAjaxRequestAndDisplayResults = function(url) {
    var filterFields = getFilterFields();

    if (filterFields.length > 0) {
        url = url.replace(/\?+$/,'');
        if (url.indexOf('?') == -1) {
            url += '?fields=' + filterFields.join(';');
        } else {
            url += '&fields=' + filterFields.join(';');
        }
    }

    $.ajax({
        method: 'GET',
        url: url,
        dataType: 'json',
        success: function(response) {
            if (!Array.isArray(response)) {
                response = [response];
            }

            countryResults = response;

            displayCounties(countryResults);
        },
        error: function(response) {
            displayNoResult();
        }
    });
};

var displayCounties = function (data) {
    if (data.length > 0) {

        var $content = $('#content');
        $content.html('');

        var selectedView = getSelectedView();

        if (selectedView == 'vertical') {
            var elementClass = 'col-sm-12 col-md-6 mb-3';
        } else {
            var elementClass = 'col-md-12 mb-3';
        }

        data.forEach(function (item, index) {
            $content.append($('<div></div>', {
                class: elementClass,
                html: getCountryCard(item, selectedView)
            }));
        });
    }
};

var displayNoResult = function() {
    $('#content').html($('<div></div>', {
        class: 'display-4 mx-auto',
        html: 'No results...'
    }));
};

var loadAllCountries = function () {
    executeAjaxRequestAndDisplayResults('https://restcountries.eu/rest/v2/all')
};

var searchByCountryName = function (name, byFullName) {
    var url = 'https://restcountries.eu/rest/v2/name/' + name;

    if (byFullName == true) {
        url = url + '?fullText=true';
    }

    executeAjaxRequestAndDisplayResults(url);
};

var searchByCountryCode = function (countryCode) {
    var url = 'https://restcountries.eu/rest/v2/alpha/' + countryCode;
    executeAjaxRequestAndDisplayResults(url);
};

var searchByCountryCurrency = function(currency) {
    var url  = 'https://restcountries.eu/rest/v2/currency/' + currency;
    executeAjaxRequestAndDisplayResults(url);
};

var searchByCountryLanguage = function(language) {
    var url = 'https://restcountries.eu/rest/v2/lang/' + language;
    executeAjaxRequestAndDisplayResults(url);
};

var searchByCountryCapital = function(capital) {
    var url = 'https://restcountries.eu/rest/v2/capital/' + capital;
    executeAjaxRequestAndDisplayResults(url);
};

var searchByCountryCallingCode = function(callingCode) {
    var url = 'https://restcountries.eu/rest/v2/callingcode/' + callingCode;
    executeAjaxRequestAndDisplayResults(url);
};

var searchByCountryRegion = function(region) {
    var url = 'https://restcountries.eu/rest/v2/region/' + region;
    executeAjaxRequestAndDisplayResults(url);
}

var searchByCountryRegionalBloc = function (blocCode) {
    var url = 'https://restcountries.eu/rest/v2/regionalbloc/' + blocCode;
    executeAjaxRequestAndDisplayResults(url);
};

$(function () {

    $('#searchForm').on('submit', function(e) {
        e.preventDefault();

        var selectedSearchOption = $('#searchSelect').val();

        if (selectedSearchOption == 'all') {
            loadAllCountries();
        } else if (selectedSearchOption == 'name') {
            var name = $('#nameFilterValueInput').val();
            var byFullName = $('#filterFullNameCheck').is(':checked');
            searchByCountryName(name, byFullName);
        } else if (selectedSearchOption == 'code') {
            var code = $('#codeFilterValueInput').val();
            searchByCountryCode(code);
        } else if (selectedSearchOption == 'currency') {
            var currency = $('#currencyFilterValueInput').val();
            searchByCountryCurrency(currency);
        } else if (selectedSearchOption == 'language') {
            var language = $('#languageFilterValueInput').val();
            searchByCountryLanguage(language);
        } else if (selectedSearchOption == 'capital') {
            var capital = $('#capitalFilterValueInput').val();
            searchByCountryCapital(capital);
        } else if (selectedSearchOption == 'callingCode') {
            var callingCode = $('#callingCodeFilterValueInput').val();
            searchByCountryCallingCode(callingCode);
        } else if (selectedSearchOption == 'region') {
            var region = $('#regionCodeFilterValueInput').val();
            searchByCountryRegion(region);
        } else if (selectedSearchOption == 'regionalBloc') {
            var regionalBloc = $('#regionCodeFilterValueSelect option:selected').val();
            searchByCountryRegionalBloc(regionalBloc);
        }
    });

    $('input[name="viewRadio"]').on('change', function() {
        displayCounties(countryResults);
    });

    $('#searchSelect').on('change', function(e) {
        var selectedOption = $(this).val();

        $('.filterValue').addClass('d-none');
        $('.filterValue :input').val('');

        if (selectedOption == 'name') {
            $('#nameFilterValue').removeClass('d-none')
        } else if (selectedOption == 'code') {
            $('#codeFilterValue').removeClass('d-none');
        } else if (selectedOption == 'currency') {
            $('#currencyFilterValue').removeClass('d-none');
        } else if (selectedOption == 'language') {
            $('#languageFilterValue').removeClass('d-none');
        } else if (selectedOption == 'capital') {
            $('#capitalFilterValue').removeClass('d-none');
        } else if (selectedOption == 'callingCode') {
            $('#callingCodeFilterValue').removeClass('d-none');
        } else if (selectedOption == 'region') {
            $('#regionFilterValue').removeClass('d-none');
        } else if (selectedOption == 'regionalBloc') {
            $('#regionalBlocFilterValue').removeClass('d-none');
        }
    });

    displayAttributesCheck();
    loadAllCountries();
});