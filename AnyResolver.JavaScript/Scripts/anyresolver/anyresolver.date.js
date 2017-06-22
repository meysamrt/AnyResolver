// Month between 1 and 12
var daysToMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
Date.getDaysInMonth = function (year, month) {
    var days = daysToMonth[month] - daysToMonth[month - 1];
    if (month === 2 && Date.isLeap(year))
        days++;
    return days;
};

Date.isLeap = function (year) {
    return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

Object.defineProperties(Date,
    {
        MAX_VALUE: {
            get: function () { return new Date(9999, 11, 31, 23, 59, 59, 999) }
        },
        MIN_VALUE: {
            get: function () { return new Date(1, 0, 1) }
        }
    });

Object.defineProperties(Date.prototype,
    {
        dayOfYear: {
            get: function () {
                var days = this.getDate() + daysToMonth[this.getMonth()];
                if (this.getMonth() > 1 && Date.isLeap(this.getFullYear()))
                    days++;
                return days;
            }
        },
        ticks: {
            get: function () {
                var sum = this.numberOfDays-1;
                sum = sum * 86400000 +
                    this.getHours() * 3600000 +
                    this.getMinutes() * 60000 +
                    this.getSeconds() * 1000 +
                    this.getMilliseconds();

                return sum * 10000;
            }
        },
        numberOfDays: {
            get:function() {
                var sum = this.dayOfYear;
                var year = this.getFullYear() - 1;
                sum += year * 365 + parseInt(year / 4) - parseInt(year / 100) + parseInt(year / 400);
                return sum;
            }
        }
    });

