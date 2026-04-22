1. /get-a-quote url should change to /get-auto-quote

on this /get-auto-quote page, add:

    a. allow adding multiple drivers
    b. allow adding multiple vehicles

Create necessary database migrations and run them as needed.

2. /get-a-quote should now be a new page where user chooses the type of insurance they want a quote for.
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
