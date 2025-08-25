// Pour les variables d'environnement
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // Ajoutez d'autres variables ici au besoin
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Pour les modules CSS et assets
declare module '*.css' {
    const content: string;
    export default content;
}

declare module '*.scss' {
    const content: string;
    export default content;
}

declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.jpg' {
    const content: string;
    export default content;
}

declare module '*.jpeg' {
    const content: string;
    export default content;
}

declare module '*.gif' {
    const content: string;
    export default content;
}