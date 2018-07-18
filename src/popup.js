function getTableRowHtml(obj) {
    return `
        <tr>
            <td>${obj.id}</td>
            <td>${obj.operator}</td>
        </tr>
    `;
}
/**
 * @param {Object} obj объект, для которого создается popup
 * Возможный пример получаемого объекта:
 * {
    "id":547,
    "type":"Feature",
    "isActive":true,
    "geometry": {
        "type":"Point",
        "coordinates":[55.77945848592653,37.79653710972446]
    },
    "properties":{
        "iconCaption":"20716",
        "details": { 
            "serialNumber":"20716",
            "isActive":true,
            "lat":55.77945848592653,
            "long":37.79653710972446,
            "connections":8,
            "chart":[5,4,7,4,2,3,8,8,2,7,8,6,5,2,8]
        }
    },
    "options":{
        "preset":"islands#blueCircleDotIconWithCaption"
    },
    "id_15318793482893809":"6717"
    }
 */
export function getPopupContent(obj) {
     
    const htmlStatus = obj.isActive
        ? `<div class="station-info-active">active</div>`
        : `<div class="station-info-defective">defective</div>`

    let content = `
        <div class="station-info">
            <div class="station-info-label">base stations</div>
            <div class="station-info-title">${obj.serialNumber}</div>
            ${htmlStatus}
            <div class="station-info-connections">${obj.connections}</div>
        </div>
    `;

    if (obj.isActive) {
        const htmlRows = obj.drones.map(getTableRowHtml).join('\n');

        const htmlTable = `
            <table class="station-info-drones-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>operator</th>
                    </tr>
                </thead>
                <tbody>
                    ${htmlRows}
                </tbody>
            </table>
        `;

        htmlInfo += htmlTable;
    }

    return content;
}