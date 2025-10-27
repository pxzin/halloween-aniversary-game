import 'uno.css';
import { mount } from 'svelte';
import App from './ui/App.svelte';

// Initialize Svelte UI using Svelte 5 API
const app = mount(App, {
  target: document.getElementById('app')!
});

export default app;
