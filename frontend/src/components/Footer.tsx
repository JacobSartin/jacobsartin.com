const commitSha = import.meta.env.VITE_COMMIT_SHA;

export default function Footer() {
  if (!commitSha) return null;

  return (
    <footer className="site-footer">
      <a
        href={`https://github.com/JacobSartin/jacobsartin.com/commit/${commitSha}`}
        title={commitSha}
        aria-label={`View build ${commitSha} on GitHub`}
        target="_blank"
        rel="noopener noreferrer"
      >
        build {commitSha.slice(0, 7)}
      </a>
    </footer>
  );
}
