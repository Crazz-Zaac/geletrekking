# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
Gele Trekking – Frontend Progress Report
✅ Project Structure

Frontend built with React.js. Pages created using React Router. Basic structure includes components, pages (some as folders with nested pages), and API connection to backend.

/frontend
/src
/components
  ContactForm.jsx
/pages
  Home.jsx
  Destination/
    AnnapurnaBaseCamp.jsx
    EverestBaseCamp.jsx
    // other destination pages
  Activities/
    Peak peak trek.jsx
    
    // other activities pages
  About.jsx
  Contact.jsx
App.js  
index.js

✅ Pages Created

    /home – Placeholder home page created.

    /destination – Folder created containing multiple destination pages (e.g., Annapurna Base Camp, Everest Base Camp).

    /activities – Folder created containing multiple activity pages (e.g., Peak peak trek,etx).

    /about – Empty/static page created.

    /contact – Contact form created and fully functional (see below).

✅ Contact Page Functionality

    Form Fields: name, email, subject (optional), message.

    Validation: name, email, and message are required.

    Backend Integration: Connected to Express/MongoDB backend via:

    POST /api/contact

    Database: Successfully saves form submissions to MongoDB using Contact model.

    User Feedback: Alerts success or error message.

🚧 Design & Styling (Not Done Yet)

    Pages have been created with basic layout or placeholders.

    No styling or design applied to any page.

    Responsive design, typography, UI components, and animations are pending.

🧠 Next Steps

    Finalize UI design and apply consistent styling.

    Populate Destination and Activities pages with real content, images, and data.

    Add responsive layout and improve accessibility.

    Optional: Add confirmation message or redirect after contact submission.

🔗 Backend Reference

    POST /api/contact endpoint lives in backend/routes/contactRoutes.js.

    Form data is saved in MongoDB via Mongoose schema (Contact.js).

🗂️ Notes

    React Router is used for navigation between pages and nested pages inside folders.

    Basic folder structure and routing are in place.

    Contact form is the only component connected to backend for now.