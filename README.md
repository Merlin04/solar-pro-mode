# SOLAR Pro Mode 🌞👨‍💻

Get the Reed College classes you want. Add courses in advance from the class schedule, then as soon as SOLAR opens you'll be signed in (without having to dig around for your PIN) and automatically registered for everything on your list.

## How to use

### Before registration day

Once installed, you'll see a button in the bottom right corner of any SOLAR page to open the Pro Mode popup. Go to the SOLAR class schedule (linked in the popup), find a class you want, click on the name to open the popup with the class info, then click the "Add to List" button in the Pro Mode popup. Repeat for all the classes you want to register for. You can rearrange the classes in your list with the up and down buttons; when you register, Pro Mode will try to register for the classes in order of top to bottom. 

You'll also need to configure the registration parameters - paste your SOLAR pin into the `PIN` field. check `Auto-auth` to automatically sign in with your PIN. If SOLAR is closed and you want to register once it opens, set `For` to "Any"; if it's currently open (for example, if you already did first-choice registration), choose "All". 

Finally, click the `Armed` checkbox. This will make the extension automatically attempt registration once you visit the main SOLAR page (not the class schedule). While there generally isn't harm in trying to register before SOLAR opens, it's best to not do so. If you want, you can leave this unchecked - that just means you'll need to click the "register" button in the popup manually.

### Registration day

A few minutes before registration, open the class schedule page and ensure your settings are properly configured. If they are, head to the main SOLAR page (linked in the popup). The page should start reloading every few seconds until registration opens. If you checked the `Armed` checkbox, it will attempt to register as soon as it sees that it can. Otherwise, you'll need to open the popup and click the "register" button yourself.

There's a chance that the extension doesn't detect that you're unable to register for the classes in your list yet, meaning it will attempt to automatically register before SOLAR is in the necessary state. If that's the case, you can just leave the page open and reload it once SOLAR opens (you can check in a private browsing window with the extension disabled).

During the automatic registration you'll probably see a bunch of status messages at the top. Once the process completes, you'll get an alert with a summary of which courses could or could not be registered. You can open the browser developer tools to see more detailed errors.

Finally, disable the `Armed` checkbox (if it was enabled) and reload the page to ensure everything's been added correctly! 

# Dev info

This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

## Getting Started

First, run the development server:

```bash
yarn dev --target=firefox-mv2
```

Then, in another terminal, `cd` into the created `build/firefox-mv2-dev` directory and run `npx web-ext dev` to run a temporary Firefox profile with your extension installed. It will automatically reload the addon when Plasmo rebuilds the files, but you probably will have to reload the page.

These instructions target Firefox (manifest v2), if you want to test with Chrome use the `chrome-mv3` target.

## Making production build

Run the following:

```bash
yarn build --target=firefox-mv2
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
