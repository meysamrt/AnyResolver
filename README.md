# AnyResolver > Persian Date
Complete persian date in Java Script
# Use
```<!DOCTYPE html>
<html>
<head>
    <script src="Scripts/jquery-3.1.1.js"></script>
    <script src="Scripts/anyresolver/anyresolver.date.js"></script>
    <script src="Scripts/anyresolver/anyresolver.persiandate.js"></script>
</head>
<body>
<script>
    
    var date = PersianDate.now;
    $("<div dir='rtl'/>").text(date.toString("dddd dd MMMM yyyy ساعت HH:mm:ss.fff")).appendTo("body");

    date = new PersianDate("1396/4/3 22:15:25.453");
    $("<div dir='rtl'/>").text(date.toString("dddd dd MMMM yyyy ساعت HH:mm:ss.fff")).appendTo("body");

</script>
</body>
</html>
```

`var pdate=new PersianDate();`  
Gets a PersianDate object that is set to 1/1/1.  

`var pdate=PersianDate.now;`  
Gets a PersianDate object that is set to the current date and time.  

`var pdate=PersianDate.today;`  
Gets a PersianDate object that is set to the today date and time.  


`var pdate=PersianDate.yesterday;`  
Gets a PersianDate object that is set to the yesterday date and time.  

[View Full Documentation](https://github.com/meysamrt/AnyResolver/wiki/PersianDate)
