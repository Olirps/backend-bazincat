const Permissoes = require('../models/Permissoes');
const GrupoAcesso = require('../models/GrupoAcesso');

class PermissionsService {

    //createPermission

    static createPermission = async (data) => {
        const { grupoAcessoId, permissoes } = data;

        // Verifica se o grupo de acesso existe
        const grupoAcesso = await GrupoAcesso.findByPk(grupoAcessoId);
        if (!grupoAcesso) {
            throw new Error('Grupo de acesso não encontrado.');
        }

        // Cria todas as permissões enviadas no array
        const newPermissions = await Promise.all(
            permissoes.map(async (perm) => {
                return await Permissoes.create({
                    grupoAcessoId,
                    pagename: perm.pagename,
                    view: perm.view,
                    edit: perm.edit,
                    delete: perm.delete,
                    insert: perm.insert
                });
            })
        );

        // Retorna no formato esperado
        return {
            id: grupoAcesso.id,
            nome: grupoAcesso.nome,
            permissoes: newPermissions.map((perm) => ({
                id: perm.id,
                pagename: perm.pagename,
                view: perm.view,
                edit: perm.edit,
                delete: perm.delete,
                insert: perm.insert
            }))
        };
    };



    static getAllPermissions = async () => {
        const permissions = await Permissoes.findAll();

        const grupoAcessoMap = new Map();

        for (const permission of permissions) {
            const grupoAcesso = await GrupoAcesso.findByPk(permission.grupoAcessoId);
            if (grupoAcesso) {
                if (!grupoAcessoMap.has(grupoAcesso.id)) {
                    grupoAcessoMap.set(grupoAcesso.id, {
                        id: grupoAcesso.id,
                        nome: grupoAcesso.nome,
                        permissoes: []
                    });
                }
                grupoAcessoMap.get(grupoAcesso.id).permissoes.push(permission.dataValues);
            }
        }

        return Array.from(grupoAcessoMap.values());
    };


    static updatePermission = async (id, updatedData) => {
        const permission = await Permissoes.findByPk(id);
        if (!permission) {
            throw new Error('Permission not found');
        }
        const updated = await permission.update(updatedData.permissoes[0]);

        const grupoacesso = await GrupoAcesso.findByPk(permission.grupoAcessoId);

        return {
            updated
        };
    }
}

module.exports = PermissionsService;