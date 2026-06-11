// Allow TypeScript to resolve CSS file imports (e.g. import './popup.css')
declare module "*.css" {
  const content: Record<string, string>
  export default content
}
