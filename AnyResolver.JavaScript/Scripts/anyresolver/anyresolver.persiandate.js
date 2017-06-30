$.enums = $.enums || function () { };
$.enums.fa = $.enums.fa || function () { };
$.extend($.enums.fa,
    {
        dayOfWeek: {
            SATURDAY: "شنبه",
            SUNDAY: "یکشنبه",
            MONDAY: "دوشنبه",
            TUESDAY: "سه شنبه",
            WEDNESDAY: "چهارشنبه",
            THURSDAY: "پنجشنبه",
            FRIDAY: "جمعه"
        },
        shortDayOfWeek: {
            SAT: "ش",
            SUN: "ی",
            MON: "د",
            TUE: "س",
            WED: "چ",
            THU: "پ",
            FRI: "ج"
        },
        monthName: {
            "FARVARDIN": "فروردین",
            "ORDIBEHESHT": "اردیبهشت",
            "KHORDAD": "خرداد",
            "TIR": "تیر",
            "MORDAD": "مرداد",
            "SHAHRIVAR": "شهریور",
            "MEHR": "مهر",
            "ABAN": "آبان",
            "AZAR": "آذر",
            "DEY": "دی",
            "BAHMAN": "بهمن",
            "ESFAND": "اسفند"
        },
        seasonName: {
            "SPRING": "بهار",
            "SUMMER": "تابستان",
            "AUTUMN": "پاییز",
            "WINTER": "زمستان"
        },
        dateParts: {
            "YEAR": 0,
            "MONTH": 1,
            "DAY": 2,
            "HOUR": 3,
            "MINUTE": 4,
            "SECOND": 5,
            "MILLISECOND": 6,
            "WEEK": 7,
            "SEASON": 8
        }
    });
var PersianDate = (function () {



    var lambdaCoefficients = [280.46645, 36000.76983, 0.0003032];
    var anomalyCoefficients = [357.5291, 35999.0503, -0.0001559, -4.8E-07];
    var eccentricityCoefficients = [0.016708617, -4.2037E-05, -1.236E-07];
    var coefficients = [angle(23, 26, 21.448), angle(0, 0, -46.815), angle(0, 0, -0.00059), angle(0, 0, 0.001813)];
    var coefficientsA = [124.9, -1934.134, 0.002063];
    var coefficientsB = [201.11, 72001.5377, 0.00057];

    var daysToMonth = [0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336, 366];

    var coefficients1900To1987 = [-2E-05, 0.000297, 0.025184, -0.181133, 0.55304, -0.861938, 0.677066, -0.212591];
    var coefficients1800To1899 = [-9E-06, 0.003844, 0.083563, 0.865736, 4.867575, 15.845535, 31.332267, 38.291999, 28.316289, 11.636204, 2.043794];

    var coefficients1700To1799 = [8.118780842, -0.005092142, 0.003336121, -2.66484E-05];
    var coefficients1620To1699 = [196.58333, -1627.0 / 400.0, 0.0219167];
    var startOf1810 = new Date(1810, 0, 1).numberOfDays;
    var startOf1900Century = new Date(1900, 0, 1).numberOfDays;
    var persianEpoch = 226895;

    var EphemerisCorrectionAlgorithmMap = function (year, algorithm) {
        this.lowestYear = year;
        this.algorithm = algorithm;
    }
    var correctionAlgorithm = {
        Default: 0,
        Year1988to2019: 1,
        Year1900to1987: 2,
        Year1800to1899: 3,
        Year1700to1799: 4,
        Year1620to1699: 5
    };
    var ephemerisCorrectionTable = [
        new EphemerisCorrectionAlgorithmMap(2020, correctionAlgorithm.Default),
        new EphemerisCorrectionAlgorithmMap(1988, correctionAlgorithm.Year1988to2019),
        new EphemerisCorrectionAlgorithmMap(1900, correctionAlgorithm.Year1900to1987),
        new EphemerisCorrectionAlgorithmMap(1800, correctionAlgorithm.Year1800to1899),
        new EphemerisCorrectionAlgorithmMap(1700, correctionAlgorithm.Year1700to1799),
        new EphemerisCorrectionAlgorithmMap(1620, correctionAlgorithm.Year1620to1699),
        new EphemerisCorrectionAlgorithmMap(-2147483648, correctionAlgorithm.Default)
    ];


    function angle(degrees, minutes, seconds) {
        return (seconds / 60 + minutes) / 60 + degrees;
    }

    function asSeason(longitude) {
        if (longitude >= 0.0)
            return longitude;
        return longitude + 360.0;
    }

    function normalizeLongitude(longitude) {
        return asSeason(longitude % 360);
    }

    function initLongitude(longitude) {
        return normalizeLongitude(longitude + 180.0) - 180.0;
    }

    function ticksToDate(ticks) {
        if (ticks < 0 || ticks > 2959075583999990000)
            throw new Error("Ticks value must be between 0 and 2959075583999990000.");
        var year = 1, month = 0, day = 1;
        var ticksInYear = 31536000000;
        var ticksInDay = 86400000;
        ticks /= 10000;

        year += parseInt(ticks / ticksInYear);
        ticks %= ticksInYear;
        var y = year - 1;
        ticks -= (parseInt(y / 4) - parseInt(y / 100) + parseInt(y / 400)) * ticksInDay;

        while (ticks < 0) {
            ticks += ticksInYear;
            if (Date.isLeap(year))
                ticks += ticksInDay;
            year--;
        }
        var tmp = Date.getDaysInMonth(year, month + 1) * ticksInDay;
        while (ticks >= tmp) {
            ticks -= tmp;
            month++;
            tmp = Date.getDaysInMonth(year, month + 1) * ticksInDay;
        }
        day += parseInt(ticks / ticksInDay);
        ticks %= ticksInDay;
        var hour = parseInt(ticks / 3600000);
        ticks %= 3600000;
        var minute = parseInt(ticks / 60000);
        ticks %= 60000;
        var second = parseInt(ticks / 1000);
        ticks %= 1000;
        var millisecond = parseInt(ticks);

        return new Date(year, month, day, hour, minute, second, millisecond);
    }

    function polynomialSum(coeffs, indeterminate) {
        var coefficient = coeffs[0];
        var num = 1.0;
        for (var index = 1; index < coeffs.length; ++index) {
            num *= indeterminate;
            coefficient += coeffs[index] * num;
        }
        return coefficient;
    }

    function defaultEphemerisCorrection(gregorianYear) {
        return (Math.pow(0.5 + (new Date(gregorianYear, 0, 1).numberOfDays -
            startOf1810), 2.0) / 41048480.0 - 15.0) / 86400.0;
    }

    function ephemerisCorrection1988To2019(gregorianYear) {
        return (gregorianYear - 1933) / 86400;
    }

    function centuriesFrom1900(gregorianYear) {
        return (new Date(gregorianYear, 6, 1).numberOfDays - startOf1900Century) / 36525.0;
    }

    function ephemerisCorrection1900To1987(gregorianYear) {
        var indeterminate = centuriesFrom1900(gregorianYear);
        return polynomialSum(coefficients1900To1987, indeterminate);
    }

    function ephemerisCorrection1800To1899(gregorianYear) {
        var indeterminate = centuriesFrom1900(gregorianYear);
        return polynomialSum(coefficients1800To1899, indeterminate);
    }

    function ephemerisCorrection1700To1799(gregorianYear) {
        var indeterminate = gregorianYear - 1700;
        return polynomialSum(coefficients1700To1799, indeterminate) / 86400.0;
    }

    function ephemerisCorrection1620To1699(gregorianYear) {
        var indeterminate = gregorianYear - 1600;
        return polynomialSum(coefficients1620To1699, indeterminate) / 86400.0;
    }

    function ephemerisCorrection(time) {
        var gregorianYear = ticksToDate(Math.min(Math.floor(time) * 864000000000, Date.MAX_VALUE.ticks)).getFullYear();
        for (var i in ephemerisCorrectionTable)
            if (ephemerisCorrectionTable[i].lowestYear <= gregorianYear)
                switch (ephemerisCorrectionTable[i].algorithm) {
                    case correctionAlgorithm.Default:
                        return defaultEphemerisCorrection(gregorianYear);
                    case correctionAlgorithm.Year1988to2019:
                        return ephemerisCorrection1988To2019(gregorianYear);
                    case correctionAlgorithm.Year1900to1987:
                        return ephemerisCorrection1900To1987(gregorianYear);
                    case correctionAlgorithm.Year1800to1899:
                        return ephemerisCorrection1800To1899(gregorianYear);
                    case correctionAlgorithm.Year1700to1799:
                        return ephemerisCorrection1700To1799(gregorianYear);
                    case correctionAlgorithm.Year1620to1699:
                        return ephemerisCorrection1620To1699(gregorianYear);
                    default:
                        return defaultEphemerisCorrection(gregorianYear);
                }
        return null;
    }

    function julianCenturies(moment) {
        return (moment + ephemerisCorrection(moment) - 730120.5) / 36525.0;
    }

    function radiansFromDegrees(degree) {
        return degree * Math.PI / 180.0;
    }

    function sinOfDegree(degree) {
        return Math.sin(radiansFromDegrees(degree));
    }

    function periodicTerm(julianCent, x, y, z) {
        return x * sinOfDegree(y + z * julianCent);
    }

    function sumLongSequenceOfPeriodicTerms(julianCent) {
        return 0.0 + periodicTerm(julianCent, 403406, 270.54861, 0.9287892) +
            periodicTerm(julianCent, 195207, 340.19128, 35999.1376958) +
            periodicTerm(julianCent, 119433, 63.91854, 35999.4089666) +
            periodicTerm(julianCent, 112392, 331.2622, 35998.7287385) +
            periodicTerm(julianCent, 3891, 317.843, 71998.20261) +
            periodicTerm(julianCent, 2819, 86.631, 71998.4403) +
            periodicTerm(julianCent, 1721, 240.052, 36000.35726) +
            periodicTerm(julianCent, 660, 310.26, 71997.4812) +
            periodicTerm(julianCent, 350, 247.23, 32964.4678) +
            periodicTerm(julianCent, 334, 260.87, -19.441) +
            periodicTerm(julianCent, 314, 297.82, 445267.1117) +
            periodicTerm(julianCent, 268, 343.14, 45036.884) +
            periodicTerm(julianCent, 242, 166.79, 1938.0 / 625.0) +
            periodicTerm(julianCent, 234, 81.53, 22518.4434) +
            periodicTerm(julianCent, 158, 3.5, -19.9739) +
            periodicTerm(julianCent, 132, 132.75, 65928.9345) +
            periodicTerm(julianCent, 129, 182.95, 9038.0293) +
            periodicTerm(julianCent, 114, 162.03, 3034.7684) +
            periodicTerm(julianCent, 99, 29.8, 33718.148) +
            periodicTerm(julianCent, 93, 266.4, 3034.448) +
            periodicTerm(julianCent, 86, 249.2, -2280.773) +
            periodicTerm(julianCent, 78, 157.6, 29929.992) +
            periodicTerm(julianCent, 72, 257.8, 31556.493) +
            periodicTerm(julianCent, 68, 185.1, 149.588) +
            periodicTerm(julianCent, 64, 69.9, 9037.75) +
            periodicTerm(julianCent, 46, 8.0, 107997.405) +
            periodicTerm(julianCent, 38, 197.1, -4444.176) +
            periodicTerm(julianCent, 37, 250.4, 151.771) +
            periodicTerm(julianCent, 32, 65.3, 67555.316) +
            periodicTerm(julianCent, 29, 162.7, 31556.08) +
            periodicTerm(julianCent, 28, 341.5, -4561.54) +
            periodicTerm(julianCent, 27, 291.6, 107996.706) +
            periodicTerm(julianCent, 27, 98.5, 1221.655) +
            periodicTerm(julianCent, 25, 146.7, 62894.167) +
            periodicTerm(julianCent, 24, 110.0, 31437.369) +
            periodicTerm(julianCent, 21, 5.2, 14578.298) +
            periodicTerm(julianCent, 21, 342.6, -31931.757) +
            periodicTerm(julianCent, 20, 230.9, 34777.243) +
            periodicTerm(julianCent, 18, 256.1, 1221.999) +
            periodicTerm(julianCent, 17, 45.3, 62894.511) +
            periodicTerm(julianCent, 14, 242.9, -4442.039) +
            periodicTerm(julianCent, 13, 115.2, 107997.909) +
            periodicTerm(julianCent, 13, 151.8, 119.066) +
            periodicTerm(julianCent, 13, 285.3, 16859.071) +
            periodicTerm(julianCent, 12, 53.3, -4.578) +
            periodicTerm(julianCent, 10, 126.6, 26895.292) +
            periodicTerm(julianCent, 10, 205.7, -39.127) +
            periodicTerm(julianCent, 10, 85.9, 12297.536) +
            periodicTerm(julianCent, 10, 146.1, 90073.778);
    }

    function cosOfDegree(degree) {
        return Math.cos(radiansFromDegrees(degree));
    }

    function aberration(julianCent) {
        return 9.74E-05 * cosOfDegree(177.63 + 35999.01848 * julianCent) - 0.005575;
    }

    function nutation(julianCent) {
        return -0.004778 * sinOfDegree(polynomialSum(coefficientsA, julianCent)) - 0.0003667 *
            sinOfDegree(polynomialSum(coefficientsB, julianCent));
    }

    function compute(time) {
        var julianCent = julianCenturies(time);
        return initLongitude(282.7771834 + 36000.76953744 * julianCent + 5.72957795130823E-06 *
            sumLongSequenceOfPeriodicTerms(julianCent) + aberration(julianCent) +
            nutation(julianCent));
    }

    function estimatePrior(longitude, time) {
        var time1 = time - 1.01456163611111 * asSeason(initLongitude(compute(time) - longitude));
        var num = initLongitude(compute(time1) - longitude);
        return Math.min(time, time1 - 1.01456163611111 * num);
    }

    function tanOfDegree(degree) {
        return Math.tan(radiansFromDegrees(degree));
    }

    function copySign(value, sign) {
        if (sign < 0)
            return -value;
        return value;
    }

    function equationOfTime(time) {
        var num1 = julianCenturies(time);
        var num2 = polynomialSum(lambdaCoefficients, num1);
        var degree = polynomialSum(anomalyCoefficients, num1);
        var x1 = polynomialSum(eccentricityCoefficients, num1);
        var num3 = tanOfDegree(polynomialSum(coefficients, num1) / 2.0);
        var x2 = num3 * num3;
        var sign = (x2 * sinOfDegree(2.0 * num2) - 2.0 * x1 * sinOfDegree(degree) +
            4.0 * x1 * x2 * sinOfDegree(degree) * cosOfDegree(2.0 * num2) -
            0.5 * Math.pow(x2, 2.0) * sinOfDegree(4.0 * num2) -
            1.25 * Math.pow(x1, 2.0) * sinOfDegree(2.0 * degree)) / (2.0 * Math.PI);
        return copySign(Math.min(Math.abs(sign), 0.5), sign);
    }

    function asLocalTime(apparentMidday, longitude) {
        var time = apparentMidday - longitude / 360.0;
        return apparentMidday - equationOfTime(time);
    }

    function midday(date, longitude) {
        return asLocalTime(date + 0.5, longitude) - longitude / 360.0;
    }

    function middayAtPersianObservationSite(date) {
        return midday(date, initLongitude(52.5));
    }

    function persianNewYearOnOrBefore(numberOfDays) {
        var num1 = Math.floor(estimatePrior(0.0, middayAtPersianObservationSite(numberOfDays))) - 1;
        var num2 = num1 + 3;
        var num3;
        for (num3 = num1; num3 !== num2; ++num3) {
            var num4 = compute(middayAtPersianObservationSite(num3));
            if (0.0 <= num4 && num4 <= 2.0)
                break;
        }
        return num3 - 1;
    }

    function getAbsoluteDatePersian(year, month, day) {
        if (year < 1 || year > 9377 || month < 1 || month > 12)
            throw new Error("Bad year, month, and day.");
        var num1 = daysToMonth[month - 1] + day - 1;
        var num2 = parseInt(365.242189 * (year - 1));
        return persianNewYearOnOrBefore(persianEpoch + num2 + 180) + num1;
    }

    function validateYear(value) {
        if (value < 1 || value > 9377)
            throw new Error("Year must be between 1 and 9377.");
    }
    function validateMonth(value, year) {
        if (value < 1 || value > 12)
            throw new Error("Month must be between 1 and 12.");
    }
    function padLeft(input, len, char) {
        input = input.toString();
        return input.length >= len ? input : new Array(len - input.length + 1).join(char) + input;
    }
    function getPersianDate(date) {
        var pdate = date;
        if (date instanceof Date)
            pdate = PersianDate.fromDate(date);
        else if (!(date instanceof PersianDate))
            throw new Error("Invalid parameter date");
        return pdate;
    }
    function toTicks(days, hours, minutes, seconds, milliseconds) {
        return (days * 86400000 +
            hours * 3600000 +
            minutes * 60000 +
            seconds * 1000 +
            milliseconds) * 10000;
    }
    function persianDateConstructor(year, month, day, hour, minute, second, millisecond) {
        var _year, _month, _day;
        var _hour, _minute, _second, _millisecond;
        var self = this;

        Object.defineProperties(this,
            {
                year: {
                    get: function () { return _year; },
                    set: function (value) {
                        validateYear(value);
                        _year = value;
                    }
                },
                month: {
                    get: function () { return _month; },
                    set: function (value) {
                        validateMonth(value, self.year);
                        _month = value;
                    }
                },
                day: {
                    get: function () { return _day; },
                    set: function (value) {
                        if (value < 1 || value > PersianDate.getDaysInMonth(self.year, self.month))
                            throw new Error("Day must be between 1 and " + PersianDate.getDaysInMonth(self.year, self.month) + ".");
                        _day = value;
                    }
                },
                hour: {
                    get: function () { return _hour; },
                    set: function (value) {
                        if (value < 0 || value > 23)
                            throw new Error("Hour must be between 0 and 23.");
                        _hour = value;
                    }
                },
                minute: {
                    get: function () { return _minute; },
                    set: function (value) {
                        if (value < 0 || value > 59)
                            throw new Error("Minute must be between 0 and 59.");
                        _minute = value;
                    }
                },
                second: {
                    get: function () { return _second; },
                    set: function (value) {
                        if (value < 0 || value > 59)
                            throw new Error("Second must be between 0 and 59.");
                        _second = value;
                    }
                },
                millisecond: {
                    get: function () { return _millisecond; },
                    set: function (value) {
                        if (value < 0 || value > 999)
                            throw new Error(
                                "Millisecond must be between 0 and 59.");
                        _millisecond = value;
                    }
                },
                dayOfYear: {
                    get: function () {
                        return self.day + daysToMonth[self.month - 1];
                    }
                },
                weekOfYear: {
                    get: function () {
                        return parseInt((self.dayOfYear + self.firstDateOfYear.dayOfWeek + 5) / 7);
                    }
                },
                weeksOfYear: {
                    get: function () {
                        return self.lastDateOfYear.weekOfYear;
                    }
                },
                dayName: {
                    get: function () {
                        var dayOfWeek = $.map($.enums.fa.dayOfWeek,
                            function (value) {
                                return value;
                            });
                        return dayOfWeek[this.dayOfWeek - 1];
                    }
                },
                shortDayName: {
                    get: function () {
                        var dayOfWeek = $.map($.enums.fa.shortDayOfWeek,
                            function (value) {
                                return value;
                            });
                        return dayOfWeek[this.dayOfWeek - 1];
                    }
                },
                dayOfWeek: {
                    get: function () {
                        var sum = self.numberOfDays % 7;
                        return (sum >= 2 ? sum - 1 : sum + 6);
                    }
                },
                daysInMonth: {
                    get: function () {
                        return PersianDate.getDaysInMonth(self.year, self.month);
                    }
                },
                monthName: {
                    get: function () {
                        return PersianDate.getMonthName(self.month);
                    }
                },
                shortMonthName: {
                    get: function () {
                        return PersianDate.getShortMonthName(self.month);
                    }
                },
                seasonName: {
                    get: function () {
                        return PersianDate.getSeasonName(self.month);
                    }
                },
                season: {
                    get: function () {
                        return PersianDate.getSeason(self.month);
                    }
                },
                firstDateOfWeek: {
                    get: function () {
                        var pdate = new PersianDate(self.year, self.month, self.day);
                        return pdate.addDays(-1 * (this.dayOfWeek - 1));
                    }
                },
                lastDateOfWeek: {
                    get: function () {
                        var date = new PersianDate(self.year, self.month, self.day);
                        return date.addDays(7 - this.dayOfWeek);
                    }
                },
                firstDateOfMonth: {
                    get: function () { return new PersianDate(self.year, self.month, 1); }
                },
                lastDateOfMonth: {
                    get: function () {
                        return new PersianDate(self.year, self.month, PersianDate.getDaysInMonth(self.year, self.month));
                    }
                },
                firstDateOfYear: {
                    get: function () { return new PersianDate(self.year, 1, 1); }
                },
                lastDateOfYear: {
                    get: function () { return new PersianDate(self.year, 12, PersianDate.getDaysInMonth(self.year, 12)); }
                },
                date: {
                    get: function () { return new PersianDate(self.year, self.month, self.day); }
                },
                ticks: {
                    get: function () {
                        return toTicks(self.numberOfDays - 1, self.hour, self.minute, self.second, self.millisecond);
                    }
                },
                ticksOfYear: {
                    get: function () {
                        return toTicks(self.dayOfYear - 1, self.hour, self.minute, self.second, self.millisecond);
                    }
                },
                ticksOfMonth: {
                    get: function () {
                        return toTicks(self.day - 1, self.hour, self.minute, self.second, self.millisecond);
                    }
                },
                ticksOfWeek: {
                    get: function () {
                        return toTicks(self.dayOfWeek - 1, self.hour, self.minute, self.second, self.millisecond);
                    }
                },
                ticksOfDay: {
                    get: function () {
                        return toTicks(0, self.hour, self.minute, self.second, self.millisecond);
                    }
                },
                numberOfDays: {
                    get: function () {
                        var sum = this.dayOfYear;
                        var y = self.year - 1;
                        var fractions = parseInt(y / 450);
                        sum += fractions * 109;
                        if (y >= 8100)
                            sum--;
                        var start = fractions * 450;
                        sum += start * 365;
                        for (var i = start + 1; i <= y; i++) {
                            sum += 365;
                            if (PersianDate.isLeap(i))
                                sum++;
                        }
                        return sum;
                    }
                }
            });
        if (arguments.length === 1) {
            var date;
            var argtype = typeof (year);
            switch (argtype) {
                case "string":
                    date = PersianDate.parse(year);
                    break;
                case "number":
                    date = PersianDate.fromTicks(year);
                    break;
                case "object":
                    if (year instanceof Date)
                        date = PersianDate.fromDate(year);
                    else
                        throw new Error("Invalid parameter.");
                    break;
                default:
                    throw new Error("Invalid parameter.");
            }
            if (date) {
                year = date.year;
                month = date.month;
                day = date.day;
                hour = date.hour;
                minute = date.minute;
                second = date.second;
                millisecond = date.millisecond;
            }
        }

        this.year = year || 1;
        this.month = month || 1;
        this.day = day || 1;
        this.hour = hour || 0;
        this.minute = minute || 0;
        this.second = second || 0;
        this.millisecond = millisecond || 0;

    };
    persianDateConstructor.prototype = {
        toDate: function () {
            var sum = this.numberOfDays - 1;
            var date = new Date(622, 2, 22, this.hour, this.minute, this.second, this.millisecond);
            date.setDate(date.getDate() + sum);
            return date;
        },
        set: function (year, month, day, hour, minute, second, millisecond) {
            this.year = year || 1;
            this.month = month || 1;
            this.day = day || 1;
            this.hour = hour || 0;
            this.minute = minute || 0;
            this.second = second || 0;
            this.millisecond = millisecond || 0;
            return this;
        },
        addDays: function (n) {
            var date = this.toDate();
            date.setDate(date.getDate() + n);
            var persiandate = PersianDate.fromDate(date);
            return this.set(persiandate.year, persiandate.month, persiandate.day, persiandate.hour, persiandate.minute, persiandate.second, persiandate.millisecond);
        },
        addMonths: function (n) {
            var sumOfDays = 0;
            var year = this.year;
            if (n > 0)
                for (var i = this.month, end = i + n, j = i; i < end; i++) {
                    if (j > 12) {
                        j = 1;
                        year++;
                        validateYear(year);
                    }
                    sumOfDays += PersianDate.getDaysInMonth(year, j);
                    j++;
                }
            else
                for (var i = this.month, end = i + n, j = i - 1; i > end; i--) {
                    if (j === 0) {
                        j = 12;
                        year--;
                        validateYear(year);
                    }
                    sumOfDays -= PersianDate.getDaysInMonth(year, j);
                    j--;
                }

            var date = this.toDate();
            date.setDate(date.getDate() + sumOfDays);
            var persiandate = PersianDate.fromDate(date);
            return this.set(persiandate.year, persiandate.month, persiandate.day, persiandate.hour, persiandate.minute, persiandate.second, persiandate.millisecond);
        },
        addYears: function (n) {
            var date = this.toDate();
            date.setFullYear(date.getFullYear() + n);
            var persiandate = PersianDate.fromDate(date);
            return this.set(persiandate.year, persiandate.month, persiandate.day, persiandate.hour, persiandate.minute, persiandate.second, persiandate.millisecond);
        },
        addHours: function (n) {
            var date = this.toDate();
            date.setHours(date.getHours() + n);
            var persiandate = PersianDate.fromDate(date);
            return this.set(persiandate.year, persiandate.month, persiandate.day, persiandate.hour, persiandate.minute, persiandate.second, persiandate.millisecond);
        },
        addMinutes: function (n) {
            var date = this.toDate();
            date.setMinutes(date.getMinutes() + n);
            var persiandate = PersianDate.fromDate(date);
            return this.set(persiandate.year, persiandate.month, persiandate.day, persiandate.hour, persiandate.minute, persiandate.second, persiandate.millisecond);
        },
        addSeconds: function (n) {
            var date = this.toDate();
            date.setSeconds(date.getSeconds() + n);
            var persiandate = PersianDate.fromDate(date);
            return this.set(persiandate.year, persiandate.month, persiandate.day, persiandate.hour, persiandate.minute, persiandate.second, persiandate.millisecond);
        },
        addMilliseconds: function (n) {
            var date = this.toDate();
            date.setMilliseconds(date.getMilliseconds() + n);
            var persiandate = PersianDate.fromDate(date);
            return this.set(persiandate.year, persiandate.month, persiandate.day, persiandate.hour, persiandate.minute, persiandate.second, persiandate.millisecond);
        },
        toShortDateString: function (format) {
            return this.toString(format || "yyyy/MM/dd");
        },
        toLongDateString: function (format) {
            return this.toString(format || "dddd dd MMMM yyyy");
        },
        toShortTimeString: function (format) {
            return this.toString(format || "HH:mm");
        },
        toLongTimeString: function (format) {
            return this.toString(format || "HH:mm:ss");
        },
        toString: function (format) {
            format = format || "";
            var formattedText = "";

            if (format) {
                for (var i = 0, len = format.length; i < len; i++) {
                    var wildcard = format[i];
                    var part = wildcard;
                    i++;
                    while (i < len && format[i] === wildcard) {
                        part += format[i];
                        i++;
                    }
                    i--;
                    switch (part) {
                        case "y":
                        case "yy":
                        case "yyy":
                        case "yyyy":
                            formattedText += padLeft(this.year, part.length, "0");
                            break;
                        case "MMMM":
                            formattedText += this.monthName;
                            break;
                        case "MMM":
                            formattedText += this.shortMonthName;
                            break;
                        case "MM":
                        case "M":
                            formattedText += padLeft(this.month, part.length, "0");
                            break;
                        case "dddd":
                            formattedText += this.dayName;
                            break;
                        case "ddd":
                            formattedText += this.shortDayName;
                            break;
                        case "dd":
                        case "d":
                            formattedText += padLeft(this.day, part.length, "0");
                            break;
                        case "HH":
                        case "H":
                            formattedText += padLeft(this.hour, part.length, "0");
                            break;
                        case "hh":
                        case "h":
                            formattedText += padLeft(this.hour % 12, part.length, "0");
                            break;
                        case "mm":
                        case "m":
                            formattedText += padLeft(this.minute, part.length, "0");
                            break;
                        case "ss":
                        case "s":
                            formattedText += padLeft(this.second, part.length, "0");
                            break;
                        case "fff":
                        case "ff":
                        case "f":
                            formattedText += padLeft(this.millisecond, part.length, "0");
                            break;
                        default:
                            formattedText += part;
                            break;
                    }
                }
            }
            if (!formattedText)
                formattedText = this.year +
                    "/" +
                    this.month +
                    "/" +
                    this.day +
                    " " +
                    this.hour +
                    ":" +
                    this.minute +
                    ":" +
                    this.second +
                    "." +
                    this.millisecond;
            return formattedText;

        },
        subtract: function (date) {
            var pdate = getPersianDate(date);

            return this.ticks - pdate.ticks;
        },
        compareTo: function (date) {
            return Math.sign(this.subtract(date));
        },
        equals: function (date) {
            return this.subtract(date) === 0;
        },
        notEquals: function (date) {
            return this.subtract(date) !== 0;
        },
        gt: function (date) {
            return this.subtract(date) > 0;
        },
        gte: function (date) {
            return this.subtract(date) >= 0;
        },
        lt: function (date) {
            return this.subtract(date) < 0;
        },
        lte: function (date) {
            return this.subtract(date) <= 0;
        },

        diff: function (date, part) {
            var pdate = getPersianDate(date);
            var dateParts = $.enums.fa.dateParts;
            var minDate = this, maxDate = pdate, sign = -1;
            if (this.gt(pdate)) {
                minDate = pdate;
                maxDate = this;
                sign = 1;
            }
            switch (part) {
                case dateParts.YEAR:
                    return this.year - pdate.year;
                case dateParts.MONTH:
                    var diffYear = maxDate.year - minDate.year - 1;
                    var diffMonth = maxDate.month - minDate.month;
                    if (diffYear === -1) {
                        diffYear = 0;
                    } else {
                        diffMonth += 12;
                    }
                    return sign * (diffYear * 12 + diffMonth);
                case dateParts.DAY:
                    return this.numberOfDays - pdate.numberOfDays;
                case dateParts.HOUR:
                    return (this.ticks - pdate.ticks) / 36000000000;
                case dateParts.MINUTE:
                    return (this.ticks - pdate.ticks) / 600000000;
                case dateParts.SECOND:
                    return (this.ticks - pdate.ticks) / 100000000;
                case dateParts.MILLISECOND:
                    return (this.ticks - pdate.ticks) / 10000;
                case dateParts.WEEK:
                    var sumOfWeek = maxDate.weekOfYear - minDate.weekOfYear;
                    for (var i = minDate.year, end = maxDate.year; i < end; i++) {
                        sumOfWeek += PersianDate.getWeeksOfYear(i);
                    }
                    return sign * sumOfWeek;
                case dateParts.SEASON:
                    var diffYear = maxDate.year - minDate.year - 1;
                    if (diffYear === -1) {
                        diffYear = 0;
                    }
                    var sumOfSeason = maxDate.season - minDate.season;
                    sumOfSeason += diffYear * 4;
                    return sign * sumOfSeason;
                default:
                    throw new Error("Invalid argument part");
            }
        }

    }
    persianDateConstructor.isLeap = function (year) {
        validateYear(year);
        if (year === 9377) return true;
        return getAbsoluteDatePersian(year + 1, 1, 1) - getAbsoluteDatePersian(year, 1, 1) === 366;
    };
    persianDateConstructor.getDaysInMonth = function (year, month) {
        validateYear(year);
        validateMonth(month, year);
        var days = daysToMonth[month] - daysToMonth[month - 1];
        if (month === 12 && !PersianDate.isLeap(year))
            return days - 1;
        return days;
    };
    persianDateConstructor.getMonthName = function (month) {
        validateMonth(month);
        var monthName = $.map($.enums.fa.monthName, function (value) {
            return value;
        });
        return monthName[month - 1];
    };
    persianDateConstructor.getShortMonthName = function (month) {
        validateMonth(month);
        var monthName = $.map($.enums.fa.monthName, function (value) {
            return value;
        });
        return monthName[month - 1];
    };
    persianDateConstructor.parse = function (dateString) {

        if (!dateString.trim()) throw new Error("Invalid date and time.");
        dateString = dateString.trim();
        var pattern = /^((\d{1,4}\/\d{1,2}\/\d{1,2})?\s*(\d{1,2}\:\d{1,2}(\:\d{1,2}(\.\d{1,3})?)?)?)$/g;
        var matches = dateString.match(pattern) || [];
        var len = matches.length;
        if (len === 0 || len > 1 || matches[0] !== dateString) throw new Error("Invalid date and time.");

        var dateTimeParts = dateString.split(/\s+/g);
        var date = "", time = "";
        if (dateTimeParts.length === 2) {
            date = dateTimeParts[0];
            time = dateTimeParts[1];
        } else {
            if (dateTimeParts[0].indexOf("/") > -1)
                date = dateTimeParts[0];
            else if (dateTimeParts[0].indexOf(":") > -1)
                time = dateTimeParts[0];
        }
        if (!date && !time) throw new Error("Invalid date and time.");
        var year = 1, month = 1, day = 1, hour = 0, minute = 0, second = 0, millisecond = 0;
        var parts;
        if (date) {
            parts = date.split("/");
            year = parseInt(parts[0]);
            month = parseInt(parts[1]);
            day = parseInt(parts[2]);
        }
        if (time) {
            parts = time.split(/[:\.]/);
            hour = parseInt(parts[0]);
            minute = parseInt(parts[1]);
            len = parts.length;
            if (len > 2)
                second = parseInt(parts[2]);
            if (len > 3)
                millisecond = parseInt(parts[3]);
        }
        return new PersianDate(year, month, day, hour, minute, second, millisecond);
    };
    persianDateConstructor.min = function (date1, date2) {
        var pdate1 = getPersianDate(date1),
            pdate2 = getPersianDate(date2);
        return pdate1.lte(pdate2) ? pdate1 : pdate2;
    };
    persianDateConstructor.max = function (date1, date2) {
        var pdate1 = getPersianDate(date1),
            pdate2 = getPersianDate(date2);
        return pdate1.gte(pdate2) ? pdate1 : pdate2;
    };
    persianDateConstructor.getSeasonName = function (month) {
        var season = PersianDate.getSeason(month);
        var seasonName = $.map($.enums.fa.seasonName, function (value) {
            return value;
        });
        return seasonName[season - 1];
    };
    persianDateConstructor.getSeason = function (month) {
        validateMonth(month);
        return (month + 2) / 3;
    };
    persianDateConstructor.getWeeksOfYear = function (year) {
        validateYear(year);
        return new PersianDate(year, 12, 1).lastDateOfYear.weekOfYear;
    };

    persianDateConstructor.fromTicks = function (ticks) {
        if (ticks < 0 || ticks > 2959075583999990000)
            throw new Error("Ticks value must be between 0 and 2959075583999990000.");
        var year = 1;
        var month = 1;
        var day = 1;
        ticks /= 10000;

        var ticksInDay = 86400000;
        var ticksInYear = 31536000000;
        year += parseInt(ticks / ticksInYear);
        ticks %= ticksInYear;
        if (year > 9377) {
            var outYear = year - 9377;
            year -= outYear;
            ticks += outYear * ticksInYear;
        }
        var y = year - 1;

        var fractions = parseInt(y / 450);
        ticks -= fractions * 109 * ticksInDay;
        if (y >= 8100)
            ticks += ticksInDay;
        var start = fractions * 450;
        for (var i = start + 1; i <= y; i++) {
            if (PersianDate.isLeap(i))
                ticks -= ticksInDay;
        }

        while (ticks < 0) {
            ticks += ticksInYear;
            year--;
            if (PersianDate.isLeap(year))
                ticks += ticksInDay;
        }

        var ticksInMonth = PersianDate.getDaysInMonth(year, month) * ticksInDay;
        while (ticks >= ticksInMonth) {
            ticks -= ticksInMonth;
            month++;
            ticksInMonth = PersianDate.getDaysInMonth(year, month) * ticksInDay;
        }


        day += parseInt(ticks / ticksInDay);
        ticks %= ticksInDay;
        var hour = parseInt(ticks / 3600000);
        ticks %= 3600000;
        var minute = parseInt(ticks / 60000);
        ticks %= 60000;
        var second = parseInt(ticks / 1000);
        ticks %= 1000;
        var millisecond = ticks;
        return new PersianDate(year, month, day, hour, minute, second, millisecond);
    };
    persianDateConstructor.fromDate = function (date) {
        if (!(date instanceof Date))
            throw new Error("Invalid date.");
        var sum = date.dayOfYear - 81;
        var y = date.getFullYear() - 1;
        var leapsToNow = parseInt(y / 4) - parseInt(y / 100) + parseInt(y / 400);
        var leapsTo622 = 150;
        sum += (y - 621) * 365 + leapsToNow - leapsTo622;

        if (sum < 0)
            throw new Error("Not supported date.");
        var year = 1, month = 1, day = 1;

        year += parseInt(sum / 365);
        sum %= 365;
        if (year > 9377) {
            var outYear = year - 9377;
            year -= outYear;
            sum += outYear * 365;
        }
        y = year - 1;

        var fractions = parseInt(y / 450);
        sum -= fractions * 109;
        if (y >= 8100)
            sum++;
        var start = fractions * 450;
        for (var i = start + 1; i <= y; i++) {
            if (PersianDate.isLeap(i))
                sum--;
        }

        while (sum < 0) {
            sum += 365;
            year--;
            if (PersianDate.isLeap(year))
                sum++;
        }

        var daysInMonth = PersianDate.getDaysInMonth(year, month);
        while (sum >= daysInMonth) {
            sum -= daysInMonth;
            month++;
            daysInMonth = PersianDate.getDaysInMonth(year, month);
        }
        if (sum > 0)
            day += sum;
        return new PersianDate(year, month, day, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
    };


    Object.defineProperties(persianDateConstructor,
        {
            MAX_VALUE: {
                get: function () { return new PersianDate(9377, 12, 30, 23, 59, 59, 999) }
            },
            MIN_VALUE: {
                get: function () { return new PersianDate(1, 1, 1) }
            },
            now: {
                get: function () {
                    return PersianDate.fromDate(new Date());
                }
            },
            today: {
                get: function () {
                    var date = new Date();
                    date.setHours(0);
                    date.setMinutes(0);
                    date.setSeconds(0);
                    date.setMilliseconds(0);
                    return PersianDate.fromDate(date);
                }
            },
            yesterday: {
                get: function () {
                    var date = new Date();
                    date.setDate(date.getDate() - 1);
                    date.setHours(0);
                    date.setMinutes(0);
                    date.setSeconds(0);
                    date.setMilliseconds(0);
                    return PersianDate.fromDate(date);
                }
            }
        });
    return persianDateConstructor;
})();













