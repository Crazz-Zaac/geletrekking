
const Dashboard = () => {
  return (
    <>
    <div>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Dashboard</title>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "\n\t/* General Reset */\nbody, h1, h2, h3, p, ul, li, a {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n    font-family: Arial, sans-serif;\n}\n\n/* Body Styling */\nbody {\n    display: flex;\n    height: 100vh;\n    background-color: #f4f4f9;\n    color: #333;\n}\n\n/* Dashboard Container */\n.dashboard-container {\n    display: flex;\n    width: 100%;\n}\n\n/* Sidebar */\n.sidebar {\n    width: 250px;\n    background-color: #2c3e50;\n    color: #fff;\n    padding: 20px;\n    display: flex;\n    flex-direction: column;\n}\n\n.sidebar h2 {\n    margin-bottom: 20px;\n    text-align: center;\n    font-size: 1.5rem;\n}\n\n.sidebar-menu {\n    list-style-type: none;\n    display: flex;\n    flex-direction: column;\n    gap: 15px;\n}\n\n.sidebar-menu li {\n    font-size: 1rem;\n}\n\n.sidebar-menu a {\n    color: #ecf0f1;\n    text-decoration: none;\n    padding: 10px;\n    border-radius: 5px;\n    transition: background 0.3s;\n}\n\n.sidebar-menu a:hover {\n    background-color: #34495e;\n}\n\n/* Main Content */\n.main-content {\n    flex: 1;\n    padding: 20px;\n    display: flex;\n    flex-direction: column;\n}\n\n.header {\n    margin-bottom: 20px;\n    text-align: center;\n}\n\n.header h1 {\n    font-size: 2rem;\n    color: #2c3e50;\n}\n\n/* Cards Section */\n.cards {\n    display: flex;\n    gap: 20px;\n    justify-content: space-around;\n}\n\n.card {\n    background-color: #ffffff;\n    padding: 20px;\n    border-radius: 10px;\n    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);\n    flex: 1;\n    text-align: center;\n}\n\n.card h3 {\n    margin-bottom: 10px;\n    font-size: 1.2rem;\n    color:rgb(6, 105, 48);\n}\n\n.card p {\n    color: #555;\n}\n\n",
          }}
        />
        
        <div className="dashboard-container">
          {/* Sidebar */}
          <aside className="sidebar">
            <h2>My Dashboard</h2>
            <ul className="sidebar-menu">
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">About us </a>
              </li>
              <li>
                <a href="#">gallery</a>
              </li>
              <li>
                <a href="#">destination</a>
              <div classname="dropdown">
           <a href="/">annapurna basecamp</a>

              </div>
              </li>
              <li>
                <a href="#">Notifications</a>
              </li>
              <li>
                <a href="#">Logout</a>
              </li>
            </ul>
          </aside>
          {/* Main Content */}
          <main className="main-content">
            <header className="header">
              <h1>Welcome to the Dashboard</h1>
            </header>
            <section className="cards">
              <div className="card">
                <h3>45005</h3>
                <p>Total Order</p>
              </div>
              <div className="card">
                <h3>4364</h3>
                <p>Total Sale</p>
              </div>
              <div className="card">
                <h3>454</h3>
                <p>Total Customer</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
