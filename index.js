const { GraphQLClient } = require('graphql-request')

document.querySelector('#btn1').addEventListener('click', e => manual())
document.querySelector('#btn2').addEventListener('click', e => automatico())
// document.querySelector('#btn2').innerText = 'automatico'
// document.querySelector('#btn1').innerText = 'manual'

const endpoint = 'https://casanova-backend-staging.herokuapp.com/graphql'
const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Imx1Y0BnbWFpbC5jb20iLCJleHAiOjE1Nzg1MDE2ODAsIm9yaWdJYXQiOjE1Nzg0OTQ0ODB9.7yb7krK7HvvQf8RbwTJzuUTFF2btqTfzjzGjpFmssuo',
  },
})

const queryForPermissions = /* GraphQL */ `
  {
    __schema {
      types {
        name
        description
        kind
        __typename
        enumValues {
          name
          description
          __typename
        }
      }
    }
  }
`

const mutationEmployeeID = `
  mutation ($username: String!, $password: String!) {
    obterToken(username: $username, password: $password){
      token
      funcionario {
        id
      }
    }
  }
`

const mutationAddPermission = `
  mutation (
    $descricao: String!
    $idEntidade: ID!
    $idFuncionario: ID!
  ) {
    darPermissao(descricao: $descricao, idEntidade: $idEntidade, idFuncionario: $idFuncionario){
      ok
    }
  }
`

const mutationAllEntitys = `
  query{
    todasEntidades{
      id
    }
  }
`

async function manual() {
  const login = document.querySelector('#nome').value
  const password = document.querySelector('#senha').value

  const data = await graphQLClient.request(queryForPermissions)
  const [permissionsType] = data.__schema.types
    .filter(e => e.name === 'PermissaoDescricao');
  const permissions = permissionsType.enumValues

  console.log({permissions})

  const employeeResponse = await graphQLClient.request(mutationEmployeeID, {
    username: login,
    password: password,
  })

  const employeeID = employeeResponse.obterToken.funcionario.id
  
  console.log({employeeID})

  const allEntitysResponse = await graphQLClient.request(mutationAllEntitys)

  const entitysIds = allEntitysResponse.todasEntidades.map(e => e.id)

  console.log({entitysIds})


  const divisinha = document.querySelector('#rootttt')
  entitysIds.forEach(entityId => {
    const btn = document.createElement('button')
    btn.innerHTML = `
    <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l">
	    ${entityId}
	</button>
    `
    btn.addEventListener('click',async e => {
      const result = await Promise.all(
        permissions.map(permission => {
          return graphQLClient.request(mutationAddPermission, {
            descricao: permission.name,
            idEntidade: entityId,
            idFuncionario: employeeID,
          })
        })
      )

      btn.innerText = entityId + 'OK'
      console.log(result)
    })
    divisinha.appendChild(btn)
  })
}


async function automatico() {
  const login = document.querySelector('#nome').value
  const password = document.querySelector('#senha').value

  const data = await graphQLClient.request(queryForPermissions)
  const [permissionsType] = data.__schema.types
    .filter(e => e.name === 'PermissaoDescricao');
  const permissions = permissionsType.enumValues

  console.log({permissions})

  const employeeResponse = await graphQLClient.request(mutationEmployeeID, {
    username: login,
    password: password,
  })

  const employeeID = employeeResponse.obterToken.funcionario.id
  
  console.log({employeeID})

  const allEntitysResponse = await graphQLClient.request(mutationAllEntitys)

  const entitysIds = allEntitysResponse.todasEntidades.map(e => e.id)

  console.log({entitysIds})
  
  console.log('inicializei')


  for (entityId of entitysIds) {
    const resultado = await Promise.all(
      permissions.map(permission =>
        graphQLClient.request(mutationAddPermission, {
          descricao: permission.name,
          idEntidade: entityId,
          idFuncionario: employeeID,
        })
      )
    )
    console.log({
      resultado,
      entityId,
    })
  }

  console.log('finalizei')
  document.querySelector('#rootttt').innerHTML = `
	<div class="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md" role="alert">
	  <div class="flex">
	    <div class="py-1"><svg class="fill-current h-6 w-6 text-teal-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg></div>
	    <div>
	      <p class="font-bold">Oii ${name}</p>
	      <p class="text-sm">Permissoes adicionadas (*-*)</p>
	    </div>
	  </div>
	</div>
  `
}