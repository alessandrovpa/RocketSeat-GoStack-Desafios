import React,{ useState, useEffect } from "react";
import api from './services/api';

import "./styles.css";

function App() {
  const [ repositories, setRepositories ] = useState([]);

  useEffect(() => {
    api.get('/repositories').then(response => {
      setRepositories(response.data);
    })
  }, []);

  async function handleAddRepository() {
    const newRepository = {
      title:`Repo ${Date.now()}`,
      url:'teste',
      techs: 'aaa'
    }
    const response = await api.post('/repositories', newRepository);
    const repository = response.data;
    console.log(repository);
    setRepositories([...repositories, repository]);
  }

  async function handleRemoveRepository(id) {
    api.delete(`/repositories/${id}`);
    setRepositories(repositories.filter(repository => repository.id!==id));
  }

  return (
    <div>
      <ul data-testid="repository-list">
        {
          repositories.map(repository => (
            <li key={repository.id}>{repository.title}
            <button onClick={() => handleRemoveRepository(repository.id)}>Remover</button></li>
          ))
        }
      </ul>

      <button onClick={handleAddRepository}>Adicionar</button>
    </div>
  );
}

export default App;
