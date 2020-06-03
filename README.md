# Calendar Gadget for [Blogger.com ](https://www.blogger.com/about/?r=1-null_user)

This gadget uses feeds, so it will not work with private blogs.

This repository contains the Eclipse project.

Eclipse Java EE IDE for Web Developers.　Version: Mars.2 Release (4.5.2)

## Browser Support

This gadget has been tested against the browsers listed below.

* Google Chrome

## Parameters
```
Calendar5_Blogger.defaults["StartYear"] = 2013; // The earliest year of the calendar.
Calendar5_Blogger.defaults["StartMonth"] = 3; // The earliest month of the calendar.
```
The earliest month of the calendar  is defined with a combination of the "StartYear" and "StartMonth" properties.

```
Calendar5_Blogger.defaults["Holidays"] = {"2013":[[1,14],[1...],...],"2014":[[1,13],...],...};
```

The date defined in JSON of the "Holidays" property will be red in the calendar.

JSON has a list of key :  value pairs delimited by comma.

The key is a year and the value is an array of arrays of containing holidays of each month of the year.

You can easily create the holiday JSON at  [休日のJSONの作成ツール、日数計算ツール](https://p--q.blogspot.jp/2017/01/json.html).

## How to Deploy

```
<div id="calendar5_blogger"></div>
<script>
...
the content of Calendar5_Blogger.js or Calendar5_Blogger.min.js
...
</script>
```

Paste this code in the HTML/JavaScript Gadget and place it on where you want to display the calendar on Layout editor.

To display the calendar on the mobile version,  the `'mobile =yes'` attribute shoud be added to the HTML widget holding the calender gadget.

## Usage

You can see a working example on [p--q](https://p--q.blogspot.jp/)'s site.

When you hover on the calendar title or arrow, a tool tip comes out.
