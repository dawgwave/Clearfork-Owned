1. preparation in order of importance. These will most likely be split into seprate commits. So we need to implement this plan in stages. Do not commit changes, I will review your changes and commit manually. After each stage, stop, wait for me to review and commit, then proceed onto the next stage:

    a. (done)create .env.local file for local running and debugging
    b. (done).ai/remove-chat.md
    c. (done)run app locally.
    d. (done).ai/nocodb-to-mysql.md
    e. get google gemini account credentials
        Do we need them?
        quote form submission seems to work locally, 
        not sure it would still work fine on production though.

2. functionality:
    a. (done) .ai/cosmetic-changes.md 
    b. registration, authentication, and authorization system with regular user and admin accounts (keep in mind other account types may be added in the future, so keep architecture flexible for that)
    c. admin page to add new blogs
    d. admin page with list of quote requests.
    e. user page to see quote requests and responses to them (via chat?)
    
