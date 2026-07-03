import { expect, request, test as base } from "@playwright/test";
import { uniqueEmail } from "@desafio/testing";

const baseURL = process.env.SERVEREST_BASE_URL ?? "http://localhost:3000";

interface CreatedResources {
  cartAuthorization?: string;
  productId?: string;
  userId?: string;
}

// Cada teste cria seus proprios dados; este fixture garante que eles sejam
// removidos ao final, mesmo que a assercao falhe no meio do teste.
const test = base.extend<{ created: CreatedResources }>({
  // eslint-disable-next-line no-empty-pattern
  created: async ({}, use) => {
    const created: CreatedResources = {};
    await use(created);
  }
});

test.afterEach(async ({ created }) => {
  const api = await request.newContext({ baseURL });

  if (created.cartAuthorization) {
    await api
      .delete("/carrinhos/cancelar-compra", { headers: { Authorization: created.cartAuthorization } })
      .catch(() => undefined);
  }
  if (created.productId) {
    await api
      .delete(`/produtos/${created.productId}`, {
        headers: created.cartAuthorization ? { Authorization: created.cartAuthorization } : undefined
      })
      .catch(() => undefined);
  }
  if (created.userId) {
    await api.delete(`/usuarios/${created.userId}`).catch(() => undefined);
  }

  await api.dispose();
});

test.describe("ServeRest API", () => {
  test("creates user, logs in, creates product and creates cart", async ({ created }) => {
    const api = await request.newContext({ baseURL });
    const email = uniqueEmail("serverest");
    const password = "Password123!";
    const userName = "QA Admin";

    const createUser = await api.post("/usuarios", {
      data: {
        administrador: "true",
        email,
        nome: userName,
        password
      }
    });
    expect(createUser.status()).toBe(201);
    const createdUser = (await createUser.json()) as { _id: string; message: string };
    expect(createdUser._id).toBeTruthy();
    created.userId = createdUser._id;

    // Confere que os valores enviados foram persistidos com o mesmo contrato (campos/tipos).
    const fetchedUser = await api.get(`/usuarios/${createdUser._id}`);
    expect(fetchedUser.status()).toBe(200);
    const fetchedUserBody = (await fetchedUser.json()) as {
      administrador: string;
      email: string;
      nome: string;
    };
    expect(fetchedUserBody).toMatchObject({ administrador: "true", email, nome: userName });

    const login = await api.post("/login", {
      data: {
        email,
        password
      }
    });
    expect(login.status()).toBe(200);
    const loginBody = (await login.json()) as { authorization: string };
    expect(loginBody.authorization).toContain("Bearer");
    created.cartAuthorization = loginBody.authorization;

    const productName = `Produto ${Date.now()}`;
    const createProduct = await api.post("/produtos", {
      data: {
        descricao: "Produto criado por teste automatizado",
        nome: productName,
        preco: 100,
        quantidade: 5
      },
      headers: {
        Authorization: loginBody.authorization
      }
    });
    expect(createProduct.status()).toBe(201);
    const productBody = (await createProduct.json()) as { _id: string };
    expect(productBody._id).toBeTruthy();
    created.productId = productBody._id;

    const fetchedProduct = await api.get(`/produtos/${productBody._id}`);
    expect(fetchedProduct.status()).toBe(200);
    const fetchedProductBody = (await fetchedProduct.json()) as {
      descricao: string;
      nome: string;
      preco: number;
      quantidade: number;
    };
    expect(fetchedProductBody).toMatchObject({
      descricao: "Produto criado por teste automatizado",
      nome: productName,
      preco: 100,
      quantidade: 5
    });

    const createCart = await api.post("/carrinhos", {
      data: {
        produtos: [
          {
            idProduto: productBody._id,
            quantidade: 1
          }
        ]
      },
      headers: {
        Authorization: loginBody.authorization
      }
    });
    expect(createCart.status()).toBe(201);
    const cartBody = (await createCart.json()) as { _id: string };
    expect(cartBody._id).toBeTruthy();

    const fetchedCart = await api.get(`/carrinhos/${cartBody._id}`);
    expect(fetchedCart.status()).toBe(200);
    const fetchedCartBody = (await fetchedCart.json()) as {
      produtos: readonly { idProduto: string; quantidade: number }[];
    };
    expect(fetchedCartBody.produtos).toMatchObject([{ idProduto: productBody._id, quantidade: 1 }]);

    await api.dispose();
  });

  test("rejects invalid user payloads", async () => {
    const api = await request.newContext({ baseURL });

    const invalidEmail = await api.post("/usuarios", {
      data: {
        administrador: "true",
        email: "invalid-email",
        nome: "Invalid User",
        password: "Password123!"
      }
    });
    expect(invalidEmail.status()).toBe(400);

    const invalidAdminFlag = await api.post("/usuarios", {
      data: {
        administrador: "maybe",
        email: uniqueEmail("invalid-admin"),
        nome: "Invalid Admin",
        password: "Password123!"
      }
    });
    expect(invalidAdminFlag.status()).toBe(400);

    await api.dispose();
  });

  test("rejects login with wrong password", async ({ created }) => {
    const api = await request.newContext({ baseURL });
    const email = uniqueEmail("wrong-password");

    const createUser = await api.post("/usuarios", {
      data: {
        administrador: "false",
        email,
        nome: "Login User",
        password: "Password123!"
      }
    });
    created.userId = ((await createUser.json()) as { _id: string })._id;

    const login = await api.post("/login", {
      data: {
        email,
        password: "wrong"
      }
    });
    expect(login.status()).toBe(401);
    const body = (await login.json()) as { message: string };
    expect(body.message).toBeTruthy();

    await api.dispose();
  });

  test("rejects invalid product and cart payloads", async ({ created }) => {
    const api = await request.newContext({ baseURL });
    const email = uniqueEmail("invalid-product");
    const password = "Password123!";

    const createUser = await api.post("/usuarios", {
      data: {
        administrador: "true",
        email,
        nome: "Product Admin",
        password
      }
    });
    created.userId = ((await createUser.json()) as { _id: string })._id;
    const login = await api.post("/login", { data: { email, password } });
    const { authorization } = (await login.json()) as { authorization: string };
    created.cartAuthorization = authorization;

    const invalidProduct = await api.post("/produtos", {
      data: {
        descricao: "Preco invalido",
        nome: `Produto invalido ${Date.now()}`,
        preco: -1,
        quantidade: 1
      },
      headers: { Authorization: authorization }
    });
    expect(invalidProduct.status()).toBe(400);

    // Um produto valido isola a causa do 400 na regra de quantidade, sem
    // misturar com o efeito colateral de um idProduto inexistente.
    const validProduct = await api.post("/produtos", {
      data: {
        descricao: "Produto valido para teste de carrinho invalido",
        nome: `Produto valido ${Date.now()}`,
        preco: 50,
        quantidade: 10
      },
      headers: { Authorization: authorization }
    });
    const validProductId = ((await validProduct.json()) as { _id: string })._id;
    created.productId = validProductId;

    const invalidCart = await api.post("/carrinhos", {
      data: {
        produtos: [{ idProduto: validProductId, quantidade: 0 }]
      },
      headers: { Authorization: authorization }
    });
    expect(invalidCart.status()).toBe(400);

    await api.dispose();
  });
});

