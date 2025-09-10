import React, { useState } from 'react';
import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { demandeCongeService } from '../services/api';
import type {DemandeConge} from '../services/api';

interface DemandeActionsProps {
    demande: DemandeConge;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onRefresh: () => void;
}

const DemandeActions: React.FC<DemandeActionsProps> = ({
                                                           demande,
                                                           onView,
                                                           onEdit,
                                                           onDelete,
                                                           onRefresh
                                                       }) => {
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
            return;
        }

        setLoading(true);
        try {
            await demandeCongeService.deleteDemandeConge(demande.id);
            onRefresh();
            onDelete();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression');
        } finally {
            setLoading(false);
            setShowMenu(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded"
                disabled={loading}
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                        <button
                            onClick={onView}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                        </button>

                        {demande.statut === 'EN_ATTENTE' && (
                            <button
                                onClick={onEdit}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                            </button>
                        )}

                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {loading ? 'Suppression...' : 'Supprimer'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DemandeActions;