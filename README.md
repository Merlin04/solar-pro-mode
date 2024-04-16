# SOLAR Pro Mode 🌞👨‍💻

![image](https://user-images.githubusercontent.com/11800751/232908437-e4e29c3d-7959-489b-89d4-4524998215c1.png)

Get the Reed College classes you want. Add courses in advance from the class schedule, then as soon as SOLAR opens you'll be signed in (without having to dig around for your PIN) and automatically registered for everything on your list.

**SOLAR Pro Mode is USE AT YOUR OWN RISK. I am not liable if this breaks and doesn't work properly or if CUS gets upset. I don't think either of those things are likely (they haven't happened so far in the ~1 yr of this extension's existence [as of writing this] + me using it for multiple registrations) but it's a possibility.**

## How to use

### Before registration day

Once installed, you'll see a button in the bottom right corner of any SOLAR page to open the Pro Mode popup. Go to the SOLAR class schedule (linked in the popup), find a class you want, click on the name to open the popup with the class info, then click the "Add to List" button in the Pro Mode popup. Repeat for all the classes you want to register for. You can rearrange the classes in your list with the up and down buttons; when you register, Pro Mode will try to register for the classes in order of top to bottom. 

You'll also need to configure the registration parameters - paste your SOLAR pin into the `PIN` field. check `Auto-auth` to automatically sign in with your PIN. If SOLAR is closed and you want to register once it opens, set `For` to "partial registration mode"; if it's currently open (for example, if you already did first-choice registration), choose "open registration mode". All values automatically save when you change them.

Finally, click the `Armed` checkbox. This will make the extension automatically attempt registration once you visit the main SOLAR page (not the class schedule), and reload the page if it isn't open yet. If you want, you can leave this unchecked - that just means you'll need to click the "register" button in the popup manually. Generally, the way you should use this is to go to the main SOLAR page and check the "armed" checkbox a minute or two before registration is scheduled to open.

### Registration day

A few minutes before registration, open the class schedule page and ensure your settings are properly configured. If they are, head to the main SOLAR page (linked in the popup), and check the `Armed` checkbox. The page should start reloading every few seconds until registration opens. The extension will attempt to register as soon as it sees that it can. 

There's a chance (especially if SOLAR is already open for registration for some classes, but not others) that the extension doesn't detect that you're unable to register for the classes in your list yet, meaning it will attempt to automatically register before SOLAR is in the necessary state. If that's the case, you can just leave the page open and reload it once SOLAR opens (you can check in a private browsing window with the extension disabled).

There's also a chance that the extension doesn't realize that you *are* able to register for classes (if you have registration mode set to "open registration mode"); in that case, you'll need to click the register button manually.

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
