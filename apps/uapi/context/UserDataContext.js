"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataProvider = UserDataProvider;
exports.useUserData = useUserData;
const react_1 = __importStar(require("react"));
const UserDataContext = (0, react_1.createContext)({ loading: true });
function UserDataProvider({ children }) {
    const [data, setData] = (0, react_1.useState)();
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        let cancelled = false;
        async function fetchData() {
            try {
                const res = await fetch('/api/auxillaries/data');
                if (!res.ok)
                    throw new Error(`Failed to fetch user data: ${res.status}`);
                const json = await res.json();
                if (!cancelled) {
                    setData(json);
                }
            }
            catch (err) {
                if (!cancelled) {
                    setError(err);
                }
            }
            finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }
        fetchData();
        return () => { cancelled = true; };
    }, []);
    return (<UserDataContext.Provider value={{ data, loading, error }}>
      {children}
    </UserDataContext.Provider>);
}
/**
 * Hook to access user data (profile, GitHub connection, BTD balance, model prefs).
 */
function useUserData() {
    return (0, react_1.useContext)(UserDataContext);
}
