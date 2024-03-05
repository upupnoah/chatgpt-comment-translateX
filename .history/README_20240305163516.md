# chatgpt-translate README

The plugin provides a translation source for the ‘comment-translate’ plugin. Itself does not activate, it starts when enabled is selected.

## Features

1. Provide translation capabilities
2. Provides online document link text

## Requirements

Please install '[comment-translate](https://github.com/intellism/vscode-comment-translate)' to use

## Use
1. After installation, call the "Change translation source" command of "Comment Translate"
    ![change](./image/change.png)
2. Check "ChatGPT translate" to configure the plugin API Key
    ![select](./image/select.png)
3. Directly use the "Comment Translate" interactive mode to translate the corresponding text

## Extension Settings

This extension contributes the following settings:

* `chatgptTranslate.authKey`: set to `authKey` to request
* `chatgptTranslate.apiAddress`: set as the requested address
* `chatgptTranslate.model`: customizing the model configuration
