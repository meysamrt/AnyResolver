var PersianDate = function (year, month, day, hour, minute, second, millisecond) {
    var _year, _month, _day;
    var _hour, _minute, _second, _millisecond;

    Object.defineProperties(this,
        {
            year: {
                get: function () { return _year; },
                set: function (value) {
                    if (value < 1 || value > 9999)
                        throw new Error("Year must be between 1 and 9999. (Object: PersianDate, Function: setYear, Argument: value)");
                    _year = value;
                }
            },
            month: {
                get: function () { return _month; },
                set: function (value) {
                    if (value < 1 || value > 12)
                        throw new Error("Month must be between 1 and 12. (Object: PersianDate, Function: setMonth, Argument: value)");
                    _month = value;
                }
            },
            day: { 
                get: function () { return _day; },
                set: function (value) {
                    if (value < 1 || value > PersianDate.daysInMonth(this.year, this.month))
                        throw new Error("Day must be between 1 and " + PersianDate.daysInMonth(this.year, this.month) + ". (Object: PersianDate, Function: setDay, Argument: value)");
                    _day = value;
                }
            },
            hour: { 
                get: function () { return _hour; },
                set: function (value) {
                    if (value < 0 || value > 23)
                        throw new Error("Hour must be between 0 and 23. (Object: PersianDate, Function: setHour, Argument: value)");
                    _hour = value;
                }
            },
            minute: { 
                get: function () { return _minute; },
                set: function (value) {
                    if (value < 0 || value > 59)
                        throw new Error("Minute must be between 0 and 59. (Object: PersianDate, Function: setMinute, Argument: value)");
                    _minute = value;
                }
            },
            second: { 
                get: function () { return _second; },
                set: function (value) {
                    if (value < 0 || value > 59)
                        throw new Error("Second must be between 0 and 59. (Object: PersianDate, Function: setSecond, Argument: value)");
                    _second = value;
                }
            },
            millisecond: { 
                get: function () { return _millisecond; },
                set: function (value) {
                    if (value < 0 || value > 999)
                        throw new Error("Millisecond must be between 0 and 59. (Object: PersianDate, Function: setMillisecond, Argument: value)");
                    _millisecond = value;
                }
            },
            dayOfYear: {
                get: function () {
                    var days = this.day;
                    for (var i = 1; i < this.month; i++)
                        days += PersianDate.daysInMonth(this.year, i);
                    return days;
                }
            },
            dayName: {
                get: function () {
                    var sum = this.dayOfYear;
                    for (var i = 1; i < this.year; i++) {
                        sum += 365;
                        if (PersianDate.isLeap(i))
                            sum++;
                    }
                    sum %= 7;

                    var dayOfWeek = $.map($.enums.fa.dayOfWeek, function (value) {
                        return value;
                    });
                    return (sum >= 3 ? dayOfWeek[sum - 3] : dayOfWeek[sum + 4]);
                }
            },
            shortDayName: {
                get: function () {
                    var sum = this.dayOfYear;
                    for (var i = 1; i < this.year; i++) {
                        sum += 365;
                        if (PersianDate.isLeap(i))
                            sum++;
                    }
                    sum %= 7;

                    var dayOfWeek = $.map($.enums.fa.shortDayOfWeek, function (value) {
                        return value;
                    });
                    return (sum >= 3 ? dayOfWeek[sum - 3] : dayOfWeek[sum + 4]);
                }
            },
            dayOfWeek: {
                get: function () {
                    var sum = this.dayOfYear;
                    for (var i = 1; i < this.year; i++) {
                        sum += 365;
                        if (PersianDate.isLeap(i))
                            sum++;
                    }
                    sum %= 7;
                    return (sum >= 3 ? sum - 3 : sum + 4);

                }
            },
            monthName: {
                get: function () {
                    return PersianDate.getMonthName(this.month);
                }
            },
            shortMonthName: {
                get: function () {
                    return PersianDate.getShortMonthName(this.month);
                }
            },
            firstDateOfWeek: {
                get: function () {
                    var date = new PersianDate(this.year, this.month, this.day);
                    return date.addDays(-1 * this.dayOfWeek);
                }
            },
            lastDateOfWeek: {
                get: function () {
                    var date = new PersianDate(this.year, this.month, this.day);
                    return date.addDays(6 - this.dayOfWeek);
                }
            },
            firstDateOfMonth: {
                get: function () { return new PersianDate(this.year, this.month, 1); }
            },
            lastDateOfMonth: {
                get: function () { return new PersianDate(this.year, this.month, PersianDate.daysInMonth(this.year, this.month)); }
            },
            firstDateOfYear: {
                get: function () { return new PersianDate(this.year, 1, 1); }
            },
            lastDateOfYear: {
                get: function () { return new PersianDate(this.year, 12, PersianDate.daysInMonth(this.year, 12)); }
            },
            date: {
                get: function () { return new PersianDate(this.year, this.month, this.day); }
            }
        });
    this.year = year || 1;
    this.month = month || 1;
    this.day = day || 1;
    this.hour = hour || 0;
    this.minute = minute || 0;
    this.second = second || 0;
    this.millisecond = millisecond || 0;
    //this.year = year;
    //this.month = month;
    //this.day = day;

};

PersianDate.prototype = {
    toDate: function () {
        var sum = this.dayOfYear;
        for (var i = 1; i < this.year; i++) {
            sum += 365;
            if (PersianDate.isLeap(i))
                sum++;
        }
        sum--;
        var date = new Date(622, 2, 22,this.hour,this.minute,this.second,this.millisecond);
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
        return this.set(persiandate.year, persiandate.month, persiandate.day,persiandate.hour,persiandate.minute,persiandate.second,persiandate.millisecond);
    },
    addMonths: function (n) {
        var date = this.toDate();
        date.setMonth(date.getMonth() + n);
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
    toShortDateString:function(format) {
        return this.toString(format||"yyyy/MM/dd");
    },
    toLongDateString:function(format) {
        return this.toString(format||"dddd dd MMMM yyyy");
    },
    toShortTimeString:function(format) {
        return this.toString(format||"HH:mm");
    },
    toLongTimeString:function(format) {
        return this.toString(format||"HH:mm:ss");
    },
    toString:function(format) {
        format = format || "";
        var formattedText = "";
        //if (format) {
        //    var pattern = /y{0,4}|M{0,4}|d{0,4}|h{0,2}|H{0,2}|m{0,2}|s{0,2}|f{0,3}|z{0,4}/g;
        //    var matches = format.match(pattern);
        //}
        if (format) {
            for (var i = 0, len = format.length; i < len; i++) {
                var wildcard = format[i];
                var part = wildcard;
                i++;
                while (i < len && format[i] == wildcard) {
                    part+=format[i];
                    i++;
                }
                i--;
                switch (part) {
                case "y":
                case "yy":
                case "yyy":
                case "yyyy":
                    formattedText+=this.year;
                    break;
                case "MMMM":
                    formattedText+=this.monthName;
                    break;
                case "MMM":
                    formattedText += this.shortMonthName;
                    break;
                case "MM":
                case "M":
                    formattedText+=this.month;
                    break;
                case "dddd":
                    formattedText+=this.dayName;
                    break;
                case "ddd":
                    formattedText+=this.shortDayName;
                    break;
                case "dd":
                case "d":
                    formattedText+=this.day;
                    break;
                case "HH":
                case "H":
                    formattedText+=this.hour;
                    break;
                case "hh":
                case "h":
                    formattedText+=this.hour > 12 ? this.hour - 12 : this.hour;
                    break;
                case "mm":
                case "m":
                    formattedText+=this.minute;
                    break;
                case "ss":
                case "s":
                    formattedText+=this.second;
                    break;
                case "fff":
                case "ff":
                case "f":
                    formattedText+=this.millisecond;
                    break;
                default:
                    formattedText+=part;
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

    }
};




PersianDate.isLeap = function (year) {
    switch (year % 33) {
        case 1: case 5: case 9: case 13:
        case 17: case 22: case 26: case 30:
            return true;
        default:
            return false;
    }
};

PersianDate.daysInMonth = function (year, month) {
    if (year < 1 || year > 9999)
        throw new Error("Year must be between 1 and 9999. (Object: PersianDate, Function: daysInMonth, Argument: year)");
    if (month < 1 || month > 12)
        throw new Error("Month must be between 1 and 12. (Object: PersianDate, Function: daysInMonth, Argument: month)");

    var days = 30;
    if (month < 7) days = 31;
    else if (month === 12 && !PersianDate.isLeap(year, month)) days = 29;
    return days;
};
PersianDate.getMonthName=function(month) {
    if (month < 1 || month > 12)
        throw new Error("Month must be between 1 and 12. (Object: PersianDate, Function: daysInMonth, Argument: month)");
    var monthName = $.map($.enums.fa.monthName, function (value) {
        return value;
    });
    return monthName[month - 1];
};
PersianDate.getShortMonthName=function(month) {
    if (month < 1 || month > 12)
        throw new Error("Month must be between 1 and 12. (Object: PersianDate, Function: daysInMonth, Argument: month)");
    var monthName = $.map($.enums.fa.monthName, function (value) {
        return value;
    });
    return monthName[month - 1];
};
PersianDate.fromDate = function (date) {
    if (!(date instanceof Date))
        throw new Error("Invalid date. (Object: PersianDate, Function: fromDate, Argument: date)");
    var sum = date.dayOfYear() - 80;
    for (var i = 622; i < date.getFullYear(); i++) {
        sum += 365;
        if (Date.isLeap(i))
            sum++;
    }
    if (sum < 0)
        throw new Error("Not supported date. (Object: PersianDate, Function: fromDate, Argument: date)");
    var year = 1, month = 1, day = 1;

    while (sum >= 365) {
        sum -= 365;
        if (PersianDate.isLeap(year)) sum--;
        if (sum >= 0) year++;
        else {
            month = 12;
            day = 30;
        }
    }

    while (sum >= PersianDate.daysInMonth(year, month)) {
        sum -= PersianDate.daysInMonth(year, month);
        month++;
    }
    if (sum > 0)
        day += sum;
    return new PersianDate(year, month, day);
};

PersianDate.now = function () {
    return PersianDate.fromDate(new Date());
}
PersianDate.today = function () {
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return PersianDate.fromDate(date);
}
PersianDate.yesterday = function () {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return PersianDate.fromDate(date);
}
