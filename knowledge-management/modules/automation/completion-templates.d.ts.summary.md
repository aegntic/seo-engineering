# Summary of completion-templates.d.ts
  
## File Path
`/home/tabs/seo-engineering/automation/node_modules/nyc/node_modules/yargs/build/lib/completion-templates.d.ts`

## Content Preview
```
export declare const completionShTemplate = "###-begin-{{app_name}}-completions-###\n#\n# yargs command completion script\n#\n# Installation: {{app_path}} {{completion_command}} >> ~/.bashrc\n#    or {{app_path}} {{completion_command}} >> ~/.bash_profile on OSX.\n#\n_yargs_completions()\n{\n    local cur_word args type_list\n\n    cur_word=\"${COMP_WORDS[COMP_CWORD]}\"\n    args=(\"${COMP_WORDS[@]}\")\n\n    # ask yargs to generate completions.\n    type_list=$({{app_path}} --get-yargs-completions \"${args[@]}\")\n\n    COMPREPLY=( $(compgen -W \"${type_list}\" -- ${cur_word}) )\n\n    # if no match was found, fall back to filename completion\n    if [ ${#COMPREPLY[@]} -eq 0 ]; then\n      COMPREPLY=()\n    fi\n\n    return 0\n}\ncomplete -o default -F _yargs_completions {{app_name}}\n###-end-{{app_name}}-completions-###\n";
export declare const completionZshTemplate = "###-begin-{{app_name}}-completions-###\n#\n# yargs command completion script\n#\n# Installation: {{app_path}} {{completion_command}} >> ~/.zshrc\n#    or {{app_path}} {{completion_command}} >> ~/.zsh_profile on OSX.\n#\n_{{app_name}}_yargs_completions()\n{\n  local reply\n  local si=$IFS\n  IFS=$'\n' reply=($(COMP_CWORD=\"$((CURRENT-1))\" COMP_LINE=\"$BUFFER\" COMP_POINT=\"$CURSOR\" {{app_path}} --get-yargs-completions \"${words[@]}\"))\n  IFS=$si\n  _describe 'values' reply\n}\ncompdef _{{app_name}}_yargs_completions {{app_name}}\n###-end-{{app_name}}-completions-###\n";

[...truncated...]
```

## Key Points
- File type: .ts
- Estimated size: 1462 characters
- Lines: 3
