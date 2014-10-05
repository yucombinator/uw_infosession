UW Infofession API
=========

An unofficial API to access information about coop info sessions at University of Waterloo. Runs on node.js, Express and Cheerio

By Yu Chen Hou

  - Access info session information without using the clumbsy website
  - Access info sessions by month

Markdown is a lightweight markup language based on the formatting conventions that people naturally use in email.  As [John Gruber] writes on the [Markdown site] [1]:

Version
----

0.1

Api Endpoints
-----------

/api/calendar/[params]
----

*optional*: params:

```js
/api/calendar/:year/:month
```

**Default: Current month**

Returns a JSON formatted list for every info session happening in the given month containing:

* **company:** Name of the company
* **link:** URL to the detailed information page
* **id:** Id of the detailed Information (to use with the event api endpoint)

/api/event/[params]
----
params:

```js
/api/event/:Id
```

Returns a JSON object containing information for the given info session id:

* **company:** Name of the company
* **date:** Date
* **time:** Time
* **location:** Location on campus
* **description:** Description of the company/event
* **programs:** Wanted student programs
* **website:** Company website
* **rsvplink:** Link to RSVP for students

License
----

GPLv3