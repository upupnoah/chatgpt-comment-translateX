
import axios from 'axios';
import { workspace } from 'vscode';
import { ITranslate, ITranslateOptions } from 'comment-translate-manager';

const PREFIXCONFIG = 'chatgptTranslate';

const langMaps: Map<string, string> = new Map([
    ['zh-CN', 'ZH'],
    ['zh-TW', 'ZH'],
]);

function convertLang(src: string) {
    if (langMaps.has(src)) {
        return langMaps.get(src);
    }
    return src.toLocaleUpperCase();
}

export function getConfig<T>(key: string): T | undefined {
    let configuration = workspace.getConfiguration(PREFIXCONFIG);
    return configuration.get<T>(key);
}



interface ChatGPTTranslateOption {
    authKey?: string;
    apiAddress?: string;
    model?: string;
    systemPrompt?: string; // 新增的系统提示配置项
    userPrompt?: string;  // 新增的用户提示配置项
}

export class ChatGPTTranslate implements ITranslate {
    get maxLen(): number {
        return 3000;
    }

    private _defaultOption: ChatGPTTranslateOption;
    constructor() {
        this._defaultOption = this.createOption();
        workspace.onDidChangeConfiguration(async eventNames => {
            if (eventNames.affectsConfiguration(PREFIXCONFIG)) {
                this._defaultOption = this.createOption();
            }
        });
    }

    createOption() {
        const defaultOption: ChatGPTTranslateOption = {
            authKey: getConfig<string>('authKey'),
            apiAddress: getConfig<string>('apiAddress'),
            model: getConfig<string>('model'),
            systemPrompt: getConfig<string>('systemPrompt'), // 获取系统提示的配置项
            userPrompt: getConfig<string>('userPrompt')  // 获取用户提示的配置项
        };
        return defaultOption;
    }
    async translate(content: string, { to = 'auto' }: ITranslateOptions) {
        const url = this._defaultOption.apiAddress + "/v1/chat/completions";
        if (!this._defaultOption.authKey) {
            throw new Error('Please check the configuration of authKey!');
        }
        let systemPrompt = this._defaultOption.systemPrompt || `You are a professional translation engine in the IT field, do not translate noun phrases and programming domain terms, only return the translation result.`;
        let userPrompt = this._defaultOption.userPrompt ? `${this._defaultOption.userPrompt}${content}` : `en => zh: ${content}`;
        const body = {
            model: this._defaultOption.model,
            temperature: 0.3,
            max_tokens: 1200,
            top_p: 1,
            frequency_penalty: 1,
            presence_penalty: 1,
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: userPrompt
                },
            ]
        };
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this._defaultOption.authKey}`,
        };

        let res = await axios.post(url, body, { headers });
        const { choices } = res.data;
        let targetTxt = choices[0].message.content;
        return targetTxt;
    }


    link(content: string, { to = 'auto' }: ITranslateOptions) {
        let str = `${this._defaultOption.apiAddress}/v1/chat/completions/${convertLang(to)}/${encodeURIComponent(content)}`;

        return `[ChatGPT](${str})`;
    }

    isSupported(src: string) {
        return true;
    }
}



