const databaseManager = await import('./database.js');

window.onload = async function () {
    registerSW();
}

// Register the Service Worker
async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator
                .serviceWorker
                .register('service-worker.js');
            console.log("SW registration successful");
        }
        catch (e) {
            console.log('SW registration failed: ', e);
        }
    }
}


window.listTableLines = async function () {
    try {
        const tableBody = document.querySelector('tbody');
        tableBody.innerHTML = '';
        const refreshButton = document.getElementById('refreshButton');
        refreshButton.setAttribute('aria-busy', 'true');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const customers = await databaseManager.listCustomers();
        for (const customer of customers) {
            const row = document.createElement('tr');
            const formatDate = (dateString) => {
                const date = new Date(dateString);
                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
            }

            row.innerHTML = `
                <th scope="row">${customer.id}</th>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${formatDate(customer.created_at)}</td>
                <td>${formatDate(customer.updated_at)}</td>
                <td><button onclick="changeToEditForm(
                    {
                        id: ${customer.id},
                        name: '${customer.name}',
                        email: '${customer.email}',
                        phone: '${customer.phone}'
                    }, event
                )">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854zM15 5l3 3"/></svg>
                </button>
                <button onclick="deleteCustomer(${customer.id})">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>
                </button></td>
            `;
            tableBody.appendChild(row);
        }
        refreshButton.setAttribute('aria-busy', 'false');
    } catch (error) {
        console.error('Failed to generate table rows:', error);
    }
}

window.changeToCreateForm = function () {
    document.getElementById('listOfClients').style.display = 'none';
    document.getElementById('newClient').style.display = 'block';

    const buttonSubmit = document.getElementById('buttonSubmit');
    buttonSubmit.textContent = 'Adicionar';
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    idToEdit = undefined;
    document.getElementById('name').focus();
}

window.upcertCustomer = async function (event) {
    event.preventDefault();
    const id = idToEdit;
    const customer = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };

    if (idToEdit) {
        await databaseManager.updateCustomer({ id, ...customer });
        idToEdit = undefined;
    } else {
        await databaseManager.createCustomer({ ...customer });
    }
    window.changeToList(event);
}

window.changeToList = function (event) {
    event && event.preventDefault();
    document.getElementById('listOfClients').style.display = 'block';
    document.getElementById('newClient').style.display = 'none';

    listTableLines();
}

window.clearDatabase = async function () {
    await databaseManager.clearAllData();
    changeToList();
}

window.deleteCustomer = async function (id) {
    await databaseManager.deleteCustomer(id);
    listTableLines();
}

let idToEdit = 0;

window.changeToEditForm = function ({ id, name, email, phone }, event) {
    event.preventDefault();
    idToEdit = id;
    const buttonSubmit = document.getElementById('buttonSubmit');

    buttonSubmit.textContent = 'Atualizar';
    document.getElementById('listOfClients').style.display = 'none';
    document.getElementById('newClient').style.display = 'block';

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    nameInput.value = name;
    emailInput.value = email;
    phoneInput.value = phone;

    nameInput.focus();
}

window.listTableLines();