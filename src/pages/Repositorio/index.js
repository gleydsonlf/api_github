import { useParams } from "react-router-dom";
import {
  Container,
  Owner,
  Loading,
  BackButton,
  IssuesList,
  PageActions,
  FilterList,
} from "./styles";
import api from "../../services/api";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";

export default function Repositorio() {
  const { repositorio } = useParams();

  const [repositorioState, setRepositorioState] = useState({});
  const [issuesState, setIssuesState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState([
    { state: "all", label: "Todas", active: true },
    { state: "open", label: "Abertas", active: false },
    { state: "closed", label: "Fechadas", active: false },
  ]);

  const [filterIndex, setFilterIndex] = useState("0");

  useEffect(() => {
    async function load() {
      const nomeRepo = decodeURIComponent(repositorio);

      const [repositorioData, issuesData] = await Promise.all([
        api.get(`/repos/${nomeRepo}`),
        api.get(`/repos/${nomeRepo}/issues`, {
          params: {
            state: filters.find(f => f.active).state,
            per_page: 5,
          },
        }),
      ]);

      setRepositorioState(repositorioData.data);
      setIssuesState(issuesData.data);
      setLoading(false);
    }

    load();
  }, [repositorio]);

  useEffect(() => {
    async function loadIssue() {
      const nomeRepo = decodeURIComponent(repositorio);

      const response = await api.get(`/repos/${nomeRepo}/issues`, {
        params: {
          state: filters[filterIndex].state,
          per_page: 5,
          page,
        },
      });

      setIssuesState(response.data);
    }

    loadIssue();
  }, [filters, filterIndex, repositorio, page]);

  function handlePage(action) {
    setPage(action === "back" ? page - 1 : page + 1);
  }

  function handleFilter(index) {
    setFilterIndex(index);
  }

  if (loading) {
    return (
      <Loading>
        <h1>Carregando</h1>
      </Loading>
    );
  }

  return (
    <div>
      <Container>
        <BackButton to="/">
          <FaArrowLeft color="#000" size={30}></FaArrowLeft>
        </BackButton>
        <Owner>
          <img
            src={repositorioState.owner.avatar_url}
            alt={repositorioState.owner.login}
          />

          <h1>{repositorioState.name}</h1>
          <p>{repositorioState.description}</p>
        </Owner>

        <FilterList active={filterIndex}>
          {filters.map((filter, index) => (
            <button
              type="button"
              key={filter.label}
              onClick={() => handleFilter(index)}
            >
              {filter.label}
            </button>
          ))}
        </FilterList>

        <IssuesList>
          {issuesState.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>

                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssuesList>

        <PageActions>
          <button
            type="button"
            onClick={() => handlePage("back")}
            disabled={page < 2}
          >
            Voltar
          </button>
          <button type="button" onClick={() => handlePage("next")}>
            Próxima
          </button>
        </PageActions>
      </Container>
    </div>
  );
}
