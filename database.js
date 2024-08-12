const { default: Dexie } = await import(
    'https://cdn.jsdelivr.net/npm/dexie@4.0.8/+esm'
);
var db = new Dexie("customerBase");
(async () => {
    db.version(1).stores({
        customers: "++id, name, email, phone, created_at, updated_at",
    });
})()

export async function listCustomers() {
    try {
        const customers = await db.customers.toArray();
        return customers;
    }
    catch (e) {
        console.log('[listCustomer] ERROR: ', e);
    }
}

export async function createCustomer({ name, email, phone }) {
    try {
        const customer = {
            name,
            email,
            phone,
            created_at: new Date(),
            updated_at: new Date(),
        };
        const createdCustomer = await db.customers.add(customer);
        console.log('[createCustomer] New customer added: ', customer);
        return createdCustomer;
    }
    catch (e) {
        console.log('[createCustomer] ERROR: ', e);
    }
}

export async function updateCustomer({ id, name, email, phone }) {
    try {
        const customer = await db.customers.get(id);
        const updatedCustomer = await db.customers.update(id, {
            ...customer,
            name: name || customer.name,
            email: email || customer.email,
            phone: phone || customer.phone,
            updated_at: new Date(),
        });
        console.log('[updateCustomer] Customer updated: ', updatedCustomer);
        return updatedCustomer;
    }
    catch (e) {
        console.log('[updateCustomer] ERROR: ', e);
    }
}

export async function deleteCustomer(id) {
    try {
        await db.customers.delete(id);
        console.log('[deleteCustomer] Customer deleted');
    }
    catch (e) {
        console.log('[deleteCustomer] ERROR: ', e);
    }
}

export async function clearAllData() {
    try {
        await db.customers.clear();
        console.log('[clearAllData] Database cleared');
    }
    catch (e) {
        console.log('[clearAllData] ERROR: ', e);
    }
}
