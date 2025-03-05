zip-extension:
    zip -r extension.zip . -x "justfile" -x "*.git/*" -x ".gitignore" -x "node_modules/*" -x "*.DS_Store"
