
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
            model: getConfig<string>('model')
        };
        return defaultOption;
    }

    async translate(content: string, { to = 'auto' }: ITranslateOptions) {
        const url = this._defaultOption.apiAddress + "/v1/chat/completions";
        if (!this._defaultOption.authKey) {
            throw new Error('Please check the configuration of authKey!');
        }
        let systemPrompt = "You are a translation engine that can only translate text and cannot interpret it.";
        let userPrompt = `translate from en to zh-Hans: "${content}" =>`;
        const body = {
            model: this._defaultOption.model,
            temperature: 0,
            max_tokens: 3000,
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

        // let res = await axios.post(url, body, { headers });
        // const { choices } = res.data;
        // let targetTxt = choices[0].message.content.trim();
        // return targetTxt;
        let res = await axios.post(url, body, { headers });
        const { choices } = res.data;
        // 将文本按行分割成数组
        let lines = choices[0].message.content.split('\n');
        // 去除每行的前后空格
        let trimmedLines = lines.map((line: string) => line.trim());
        // 将处理过的行合并为一个字符串，每行之间以换行符连接
        let targetTxt = trimmedLines.join('\n');
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



