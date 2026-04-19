1. preparation in order of importance. These will most likely be split into seprate commits. So we need to implement this plan in stages. Do not commit changes, I will review your changes and commit manually. After each stage, stop, wait for me to review and commit, then proceed onto the next stage:

    a. (done)create .env.local file for local running and debugging
    b. (done).ai/remove-chat.md
    c. (done)run app locally.
    d. (done).ai/nocodb-to-mysql.md
    e. get google gemini account credentials
        Do we need them?
        quote form submission seems to work locally, 
        not sure it would still work fine on production though.
    f. migrate from google cloud to digital ocean - create deployment script

2. functionality:
    a. (done) .ai/cosmetic-changes.md 
    b. (done) registration, authentication, and authorization system with regular user and admin accounts (keep in mind other account types may be added in the future, so keep architecture flexible for that)
    c. (done) admin blog post management
    d. (done) admin page with list of quote requests.
    e. (done) user page to see quote requests and responses to them via chat with ability to send images and attach documents. We will probably need tables like chats, chat_messages, chat_images, and any other relevant tables.
