# GenCodes Editor


Source code for https://gen.codes

## Developing

```
# install and setup
yarn setup

# run locally, this can take a long time to boot up
yarn start

# run unit tests
yarn test

# run cypress
yarn cypress
```

### Adding a new TypeScript version

1. Update _sites/package.json_ with new version.
2. Run `yarn updateCompilerFiles` in the root directory.
