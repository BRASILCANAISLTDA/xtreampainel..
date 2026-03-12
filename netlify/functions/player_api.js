const axios = require('axios');

// CONFIGURAÇÃO: Substitua pelo link da sua lista M3U
const M3U_URL = "LINK_DA_SUA_LISTA_AQUI"; 

exports.handler = async (event) => {
    const { action, username, password } = event.queryStringParameters;

    // Simulação de Login (Pode personalizar)
    if (username !== "admin" || password !== "admin") {
        return { statusCode: 200, body: JSON.stringify({ user_info: { auth: 0 } }) };
    }

    try {
        const response = await axios.get(M3U_URL);
        const rawData = response.data;
        
        // Função simples para parsear M3U manualmente
        const items = parseM3U(rawData);

        // Separação por categorias
        const live = items.filter(i => !i.isVOD && !i.isSeries);
        const movies = items.filter(i => i.isVOD);
        const series = items.filter(i => i.isSeries);

        switch (action) {
            case "get_live_categories":
                return { statusCode: 200, body: JSON.stringify([{ category_id: "1", category_name: "Canais Diretos" }]) };
            
            case "get_live_streams":
                return { statusCode: 200, body: JSON.stringify(live.map((item, idx) => ({
                    num: idx + 1, name: item.name, stream_id: idx + 1, stream_icon: item.logo, category_id: "1"
                }))) };

            case "get_vod_streams":
                return { statusCode: 200, body: JSON.stringify(movies.map((item, idx) => ({
                    num: idx + 1, name: item.name, stream_id: idx + 1, stream_icon: item.logo, category_id: "1", container_extension: "mp4"
                }))) };

            default:
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        user_info: { auth: 1, status: "Active", exp_date: "1735689600" },
                        server_info: { url: "seu-site.netlify.app", port: "80" }
                    })
                };
        }
    } catch (err) {
        return { statusCode: 500, body: "Erro ao ler lista." };
    }
};

// Lógica de separação baseada em nomes e grupos comuns
function parseM3U(data) {
    const lines = data.split('\n');
    const results = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF:')) {
            const info = lines[i];
            const url = lines[i + 1];
            const name = info.split(',')[1] || "Sem nome";
            
            results.push({
                name: name.trim(),
                url: url.trim(),
                logo: info.match(/tvg-logo="(.*?)"/)?.[1] || "",
                isSeries: name.match(/S\d{2}/i) || info.toLowerCase().includes('series'),
                isVOD: info.toLowerCase().includes('filmes') || info.toLowerCase().includes('movies') || url.includes('.mp4')
            });
        }
    }
    return results;
}
