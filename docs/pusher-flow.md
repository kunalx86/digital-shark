# Pusher Flow

## Server Side
- Create mutation `join-room` with auction id as parameter
- Perform checks to verify whether or not we can join the room (am I early than 10 mins etc.)
- On success redirect to a specific page
- Begin client side connection flow
- On Channel auth API, grab the channel name `presence-[slug]` where slug will be auction id;
authorize only if it is possible to join that auction
- On successful connection, trigger `bid` mutation with auction and bid price as parameters. Verify whether the bid can be made or not, save user id and bid price as tuple in Redis where auction id is key
- After successful write, trigger event `new-bid` with user id, bid price, and 2 timestamps where timestamp #1 is when the actual countdown begins and timestamp #2 is when countdown is over after which the top most bidder will be the winner as the data


## Client Side