Date.daysInMonth = function (year, month) {
    var days = 31;
    switch (month) {
        case 4: case 6: case 9: case 11:
            days = 30;
            break;
        case 2:
            days = 28;
            if (Date.isLeap(year))
                days = 29;
            break;
    }
    return days;
};

Date.isLeap = function (year) {
    return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

Date.prototype.dayOfYear = function () {
    var days = this.getDate();
    for (var i = 1; i <= this.getMonth(); i++) 
        days += Date.daysInMonth(this.getFullYear(), i);
    return days;
}