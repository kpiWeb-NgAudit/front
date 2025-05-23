import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
      <div>
        <h2>404 - Page introuvable</h2>
        <p>Désolé, la page que vous recherchez n'existe pas.</p>
        <Link to="/">Aller à la page d'accueil</Link>
      </div>
  );
}

export default NotFoundPage;