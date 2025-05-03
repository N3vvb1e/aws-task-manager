const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>
        &copy; {currentYear} Task Manager App. Built with React, Vite, and AWS.
      </p>
    </footer>
  );
};

export default Footer;
