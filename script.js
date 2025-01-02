document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bill-form');
    const addItemButton = document.getElementById('add-item');
    const billTableBody = document.querySelector('#bill-table tbody');
    const totalAmountEl = document.getElementById('total-amount');
    const finalAmountEl = document.getElementById('final-amount');
    const downloadBillButton = document.getElementById('download-bill');
    const billDateEl = document.getElementById('bill-date');
    const billTimeEl = document.getElementById('bill-time');
    const discountInput = document.getElementById('discount');
    const gstInput = document.getElementById('gst');

    let totalAmount = 0;
    let billItems = [];

    // Set the date and time
    const updateDateTime = () => {
        const now = new Date();
        billDateEl.textContent = now.toLocaleDateString();
        billTimeEl.textContent = now.toLocaleTimeString();
    };
    updateDateTime();

    // Add item to the bill
    addItemButton.addEventListener('click', () => {
        const itemName = document.getElementById('item-name').value;
        const itemQuantity = parseInt(document.getElementById('item-quantity').value);
        const itemPrice = parseFloat(document.getElementById('item-price').value);

        if (!itemName || itemQuantity <= 0 || itemPrice <= 0) {
            alert('Please enter valid item details.');
            return;
        }

        const itemTotal = itemQuantity * itemPrice;
        totalAmount += itemTotal;

        // Add item to billItems array
        billItems.push({
            item: itemName,
            quantity: itemQuantity,
            price: `$${itemPrice.toFixed(2)}`,
            total: `$${itemTotal.toFixed(2)}`
        });

        // Add row to table in the browser
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${itemName}</td>
            <td>${itemQuantity}</td>
            <td>$${itemPrice.toFixed(2)}</td>
            <td>$${itemTotal.toFixed(2)}</td>
        `;
        billTableBody.appendChild(row);

        updateTotals();
        form.reset();
    });

    // Update total and final amounts
    const updateTotals = () => {
        const discount = parseFloat(discountInput.value) || 0;
        const gst = parseFloat(gstInput.value) || 0;

        const discountedAmount = totalAmount - (totalAmount * discount) / 100;
        const gstAmount = (discountedAmount * gst) / 100;
        const finalAmount = discountedAmount + gstAmount;

        totalAmountEl.textContent = `Total: $${totalAmount.toFixed(2)}`;
        finalAmountEl.textContent = `Final Total (After Discount & GST): $${finalAmount.toFixed(2)}`;
    };

    discountInput.addEventListener('input', updateTotals);
    gstInput.addEventListener('input', updateTotals);

    // Download the bill as a PDF
    downloadBillButton.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add title, date, and time
        doc.text('Restaurant Bill', 10, 10);
        doc.text(`Date: ${billDateEl.textContent}`, 10, 20);
        doc.text(`Time: ${billTimeEl.textContent}`, 10, 30);

        // Add the table
        const columns = [
            { header: 'Item', dataKey: 'item' },
            { header: 'Quantity', dataKey: 'quantity' },
            { header: 'Price', dataKey: 'price' },
            { header: 'Total', dataKey: 'total' }
        ];

        doc.autoTable({
            head: [columns.map(col => col.header)],
            body: billItems.map(item => [item.item, item.quantity, item.price, item.total]),
            startY: 40,
            margin: { left: 10, right: 10 }
        });

        // Add totals
        let finalY = doc.lastAutoTable.finalY || 40;
        doc.text(totalAmountEl.textContent, 10, finalY + 10);
        doc.text(finalAmountEl.textContent, 10, finalY + 20);

        // Save the PDF
        doc.save('bill.pdf');
    });
});
