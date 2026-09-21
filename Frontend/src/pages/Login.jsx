function Login() {
  return (
    <div>
      <h1>Connexion</h1>

      <form>
        <div>
          <label>Email</label>
          <input type="email" />
        </div>

        <div>
          <label>Mot de passe</label>
          <input type="password" />
        </div>

        <button type="submit">
          Se connecter
        </button>
      </form>
    </div>
  )
}

export default Login