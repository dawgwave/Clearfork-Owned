1. update deployment script ./scripts/deploy.sh. 

it deploys whatever branch is currently checked out.
if the current branch is not master, the script should say so and stop.
i do not want to deploy to production unless I finished testing and merged the feature branch to master.

2. need a way to set up a test server on ubuntu droplet at http://67.205.157.124/.

make some suggestions on how this could be achieved. 

My idea is to have th test server under some sub-url of the live server,

for example: https://clearforkinsurance.com/test/

this page will only be acessible from ip 217.30.74.35, otherwise redirect to https://clearforkinsurance.com/

Do you think this is a good idea or do you hav e abetter one?

3. I also need a deployment script to deploy a currently checked out feature branch to this test server.

4. /get-a-quote url should change to /get-auto-quote

on this /get-auto-quote page, add:

    a. allow adding multiple drivers
    b. allow adding multiple vehicles

Create necessary database migrations and run them as needed.

5. /get-a-quote should now be a new page where user chooses the type of insurance they want a quote for.
List of insurance types and corresponding urls for pages for each type:

Home                        /get-auto-quote
Auto                        /get-auto-quote 
Umbrella                    /get-umbrella-quote
Boat                        /get-boat-quote
RV                          /get-rv-quote
ATV                         /get-atv-quote
Motorcycle                  /get-motorcycle-quote
Commercial                  /get-commercial-quote
Life                        /get-life-quote
Performance and Bid Bonds   /get-performance-and-bid-bonds-quote
Cyber Insurance             /get-cyber-quote

For now each of these pages will have similar fields. You may add or remove fields as you see fit. 
For example, some fields might make sense for life insurance, but not for boat insurance and vice versa.
Create necessary database migrations and run them.

---------------------------------------------------------------
- other forms / quote types
- vlog management page (same as blog management page)

- connect clearfork email account
- email verification
- MFA
- google account sign in
- apple account sign in

----------------------------------------------------------------
- insuretheinternet.com - will be a separate site for cyber insurance sales
