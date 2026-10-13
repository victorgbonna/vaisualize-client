# Reusable template structure

The following is the reusable subset of this project. Project-specific routes,
components, utilities, data, and public assets are intentionally omitted.

```text
public/
├── images/
└── svg/

src/
├── components/
│   ├── helper/
│   │   ├── Datafetch.jsx
│   │   ├── ImageContainer.jsx
│   │   ├── InputHelper.jsx
│   │   ├── LoadButton.jsx
│   │   ├── Loading/
│   │   │   ├── Loading.module.css
│   │   │   └── index.jsx
│   │   ├── SelectOption/
│   │   │   ├── index.jsx
│   │   │   ├── selectFilters.jsx
│   │   │   ├── selectMultiple.jsx
│   │   │   └── valueAsObject.jsx
│   │   ├── adminlayout/
│   │   ├── nav/
│   │   └── userlayout/
│   ├── modal/
│   │   └── modalLayout.jsx
│   └── table/
│       └── TableLayout.jsx
├── configs/
│   ├── apiEndpoints/
│   │   └── index.js
│   ├── appLinkConverter.js
│   ├── baseUrl/
│   │   └── index.js
│   ├── chatChecker/
│   │   └── index.js
│   ├── commafy/
│   │   └── index.js
│   ├── consolelog/
│   │   └── index.js
│   ├── dataiChatFunctionalities.js
│   ├── fakedata.js
│   ├── getNearestMultipleOfN.js
│   ├── index.js
│   ├── kFormatter/
│   │   └── index.js
│   ├── pageRoutes/
│   │   └── index.js
│   ├── pagination.js
│   └── timeStampControl.js
├── context/
│   ├── index.js
│   ├── useDataRequestContext.js
│   ├── useEnterChatContext.js
│   ├── useFilterReducerContext.js
│   └── useProjectDataContext.js
└── hooks/
    ├── index.js
    ├── useFileInput/
    │   ├── index.jsx
    │   └── multiple.jsx
    ├── useHttpServices/
    │   └── index.jsx
    ├── useLocalStorage/
    │   └── index.jsx
    ├── useOnClickOutside/
    │   └── index.jsx
    ├── useRouterQuery/
    │   └── index.js
    ├── useToast/
    │   └── index.js
    └── useValidations/
        └── index.js
```

The existing application files remain in the repository; this tree documents
the reusable template layout rather than the complete Next.js application.
