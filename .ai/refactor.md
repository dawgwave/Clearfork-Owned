1. preparation in order of importance. These will most likely be split into seprate commits. So we need to implement this plan in stages. Do not commit changes, I will review your changes and commit manually. After each stage, stop, wait for me to review and commit, then proceed onto the next stage:

    a. (done)create .env.local file for local running and debugging
    b. (done).ai/remove-chat.md
    c. (done)run app locally.
    d. (done).ai/nocodb-to-mysql.md
    e. get google gemini account credentials
        Do we need them?
        quote form submission seems to work locally, 
        not sure it would still work fine on production though.
    f. (done) migrate from google cloud to digital ocean
       i. I can connect to droplet via web console. not sure if I have ssh keys set up locally to be able to ssh into the droplet from my terminal. How do you suggest we handle deployment?

2. functionality:
    a. (done) .ai/cosmetic-changes.md 
    b. (done) registration, authentication, and authorization system with regular user and admin accounts (keep in mind other account types may be added in the future, so keep architecture flexible for that)
    c. https
    d. email verification
    f. (done) admin blog post management
    g. (done) admin page with list of quote requests.
    h. (done) user page to see quote requests and responses to them via chat with ability to send images and attach documents. We will probably need tables like chats, chat_messages, chat_images, and any other relevant tables.
