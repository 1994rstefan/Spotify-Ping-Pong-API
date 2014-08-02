# Spotify Ping Pong API

## Basic usage
1. Run server.js with Node.js
2. Open http://localhost:8080/worker.html in your browser (Browser must support Adobe Flash and WebSockets)
3. Send API requests

## API Request
Send a HTTP request on port 80 to the API server where the ping is the path of the URI. The parts of the ping have to be separated by "-" (minus) instead of " " (space).
Example: http://server/12-34-56-78-90-12-34-56-78-90-12-34-56-78-90-12-34-56-78-90
(Do not use a trailing slash!)

## API Response
The response will be a JSON encoded object.
The object will always have an "status" property. (Status codes in next section)
If the status is 100 (OK) there will also be a "ping" and "pong" property. "ping" will be the initial sent ping, "pong" will be the generated pong.
The "ping" and "pong" properties will be "-" (minus) separated and so have to get decoded.
If the status code is not 100 the "ping" and "pong" properties will be missing.

## Status codes
### 1XX - OK
* 100 - OK

### 2XX - Error
* 201 - Ping scheme not valid
* 202 - Unknown error generating the pong, maybe Adobe Flash crashed while generating the ping.
* 203 - There are currently no running worker processes, try again in a minute
#### 29X - Error (which will get fixed in the future)
* 290 - The ping you sent is currently getting processed. - This error should be really rare and is an issue in the servers design and how it handles the callbacks. This will get fixed some time.
* 291 - There was an error while sending the ping to the worker, maybe the connection closed just in this moment. Just retry and send the ping again. - This will get fixed in the future so the server automatically sends the ping command to another worker.