

## API

### CLAIMS

#### List All Claims

```
GET
/api/claims?[status=accepted]
```

#### Add a claim

```
POST
/api/claims/add

BODY

{
    user: "championswimmer",
    issueUrl: "http://github.com/coding-blocks/lab/issues/7",
    pullUrl: "http://github.com/coding-blocks/lab/pull/7",
    bounty: 20
}
```
