import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Download, Trash2, FileText, Search, User, AlertCircle } from 'lucide-react';
import { employeService, type Employe } from '../services/api';

// Interface qui correspond au type retourné par l'API
interface EmployeDocument {
    id?: number;
    nom: string;
    typeDocument: string;
    description?: string; // Rendons description optionnelle pour correspondre à l'API
    dateUpload: string;
    cheminFichier: string;
    tailleFichier?: number;
}

const Documents: React.FC = () => {
    const [employes, setEmployes] = useState<Employe[]>([]);
    const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null);
    const [documents, setDocuments] = useState<EmployeDocument[]>([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadEmployes = useCallback(async () => {
        try {
            setError(null);
            const data = await employeService.getAllEmployes();
            setEmployes(data);
            if (data.length > 0 && !selectedEmploye) {
                setSelectedEmploye(data[0]);
            }
        } catch (error) {
            console.error('Erreur chargement employés:', error);
            setError('Erreur lors du chargement des employés');
        } finally {
            setLoading(false);
        }
    }, [selectedEmploye]);

    const loadDocuments = useCallback(async () => {
        if (!selectedEmploye) return;
        try {
            setError(null);
            const data = await employeService.getDocuments(selectedEmploye.id);
            // Conversion explicite du type pour correspondre à EmployeDocument
            const formattedData: EmployeDocument[] = data.map((doc: any) => ({
                id: doc.id,
                nom: doc.nom,
                typeDocument: doc.typeDocument,
                description: doc.description || '', // Fournir une valeur par défaut si undefined
                dateUpload: doc.dateUpload,
                cheminFichier: doc.cheminFichier,
                tailleFichier: doc.tailleFichier
            }));
            setDocuments(formattedData);
        } catch (error) {
            console.error('Erreur chargement documents:', error);
            setError('Erreur lors du chargement des documents');
        }
    }, [selectedEmploye]);

    useEffect(() => {
        loadEmployes();
    }, [loadEmployes]);

    useEffect(() => {
        if (selectedEmploye) {
            loadDocuments();
        }
    }, [selectedEmploye, loadDocuments]);

    const handleUpload = async (file: File, documentData: Omit<EmployeDocument, 'id' | 'dateUpload' | 'cheminFichier'>) => {
        if (!selectedEmploye) return;

        console.log('Début upload:', {
            employeId: selectedEmploye.id,
            file: file.name,
            fileSize: file.size,
            fileType: file.type,
            documentData
        });

        // Validation du fichier
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setError('Le fichier est trop volumineux (max 10MB)');
            return;
        }

        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            setError('Type de fichier non autorisé. Types autorisés: PDF, JPEG, PNG, DOC, DOCX');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            console.log('Appel API upload...');
            await employeService.uploadDocument(selectedEmploye.id, file, {
                ...documentData,
                description: documentData.description || ''
            });

            console.log('Upload réussi');
            setShowUploadForm(false);
            await loadDocuments();

        } catch (error: any) {
            console.error('Erreur détaillée upload:', error);

            // Afficher plus de détails sur l'erreur
            if (error.response?.data) {
                console.error('Réponse erreur:', error.response.data);
                setError(`Erreur serveur: ${JSON.stringify(error.response.data)}`);
            } else if (error.code === 'ERR_NETWORK') {
                setError('Erreur de connexion au serveur. Vérifiez que le serveur est démarré.');
            } else {
                setError('Erreur lors de l\'upload du document: ' + error.message);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!selectedEmploye) return;
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            try {
                setError(null);
                await employeService.deleteDocument(selectedEmploye.id, id);
                await loadDocuments();
            } catch (error) {
                console.error('Erreur suppression document:', error);
                setError('Erreur lors de la suppression du document');
            }
        }
    };

    const handleDownload = async (document: EmployeDocument) => {
        try {
            setError(null);
            const response = await fetch(`http://localhost:8080/api/uploads/${document.cheminFichier}`);

            if (!response.ok) {
                throw new Error('Fichier non trouvé');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Utiliser window.document au lieu de document pour éviter le conflit
            const a = window.document.createElement('a');
            a.href = url;
            a.download = document.nom;
            window.document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            window.document.body.removeChild(a);
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            setError('Erreur lors du téléchargement du document');
        }
    };

    const getDocumentTypeIcon = (type: string) => {
        switch (type) {
            case 'CV': return '📄';
            case 'DIPLOME': return '🎓';
            case 'CONTRAT': return '📝';
            case 'PHOTO': return '📸';
            case 'CERTIFICAT': return '🏆';
            default: return '📁';
        }
    };

    const formatFileSize = (bytes: number = 0): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredEmployes = employes.filter(emp =>
        emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDocuments = documents.filter(doc =>
        doc.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.typeDocument.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        {error}
                    </div>
                </div>
            )}

            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Gestion des documents</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Gestion des documents des employés
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Liste des employés */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Employés</h3>
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredEmployes.map((employe) => (
                                <div
                                    key={employe.id}
                                    onClick={() => setSelectedEmploye(employe)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                        selectedEmploye?.id === employe.id
                                            ? 'bg-blue-100 border border-blue-300'
                                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        {employe.photoProfil ? (
                                            <img
                                                src={`http://localhost:8080/uploads/${employe.photoProfil}`}
                                                alt={`${employe.prenom} ${employe.nom}`}
                                                className="h-8 w-8 rounded-full object-cover mr-3"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                                                {employe.prenom[0]}{employe.nom[0]}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {employe.prenom} {employe.nom}
                                            </p>
                                            <p className="text-xs text-gray-500">{employe.matricule}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Documents */}
                <div className="lg:col-span-3">
                    {selectedEmploye ? (
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    {selectedEmploye.photoProfil ? (
                                        <img
                                            src={`http://localhost:8080/uploads/${selectedEmploye.photoProfil}`}
                                            alt={`${selectedEmploye.prenom} ${selectedEmploye.nom}`}
                                            className="h-16 w-16 rounded-full object-cover mr-4"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                                            {selectedEmploye.prenom[0]}{selectedEmploye.nom[0]}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {selectedEmploye.prenom} {selectedEmploye.nom}
                                        </h3>
                                        <p className="text-gray-600">{selectedEmploye.matricule} • {selectedEmploye.poste}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowUploadForm(true)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Uploader
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher des documents..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredDocuments.map((document) => (
                                    <div key={document.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center">
                                                <span className="text-2xl mr-3">{getDocumentTypeIcon(document.typeDocument)}</span>
                                                <div>
                                                    <h5 className="font-medium text-gray-900">{document.nom}</h5>
                                                    <p className="text-sm text-gray-600">{document.typeDocument}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleDownload(document)}
                                                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                                                    title="Télécharger"
                                                    aria-label="Télécharger le document"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(document.id!)}
                                                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                                    title="Supprimer"
                                                    aria-label="Supprimer le document"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        {document.description && (
                                            <p className="text-sm text-gray-600 mb-2">{document.description}</p>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-gray-500">
                                                Uploadé le: {new Date(document.dateUpload).toLocaleDateString('fr-FR')}
                                            </p>
                                            {document.tailleFichier && (
                                                <span className="text-xs text-gray-400">
                                                    {formatFileSize(document.tailleFichier)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {filteredDocuments.length === 0 && (
                                    <div className="col-span-2 text-center py-12 text-gray-500">
                                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                        <p>Aucun document trouvé</p>
                                        <p className="text-sm">Commencez par uploader un document</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg p-12 text-center">
                            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un employé</h3>
                            <p className="text-gray-600">Choisissez un employé dans la liste pour voir et gérer ses documents</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal d'upload */}
            {showUploadForm && selectedEmploye && (
                <UploadForm
                    onClose={() => setShowUploadForm(false)}
                    onUpload={handleUpload}
                    uploading={uploading}
                />
            )}
        </div>
    );
};

// Composant pour l'upload de documents
const UploadForm: React.FC<{
    onClose: () => void;
    onUpload: (file: File, documentData: any) => void;
    uploading: boolean;
}> = ({ onClose, onUpload, uploading }) => {
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        nom: '',
        typeDocument: 'AUTRE',
        description: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (file) {
            onUpload(file, formData);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            if (!formData.nom) {
                setFormData({ ...formData, nom: e.target.files[0].name });
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-medium mb-4">Uploader un document</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fichier *
                        </label>
                        <input
                            type="file"
                            required
                            onChange={handleFileChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            aria-required="true"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom du document *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.nom}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            aria-required="true"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type de document *
                        </label>
                        <select
                            value={formData.typeDocument}
                            onChange={(e) => setFormData({ ...formData, typeDocument: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            aria-required="true"
                        >
                            <option value="CV">CV</option>
                            <option value="DIPLOME">Diplôme</option>
                            <option value="CERTIFICAT">Certificat</option>
                            <option value="CONTRAT">Contrat</option>
                            <option value="PHOTO">Photo</option>
                            <option value="LETTRE_CREANCE">Lettre de créance</option>
                            <option value="ORDINATION">Ordination</option>
                            <option value="ATTESTATION_TRAVAIL">Attestation de travail</option>
                            <option value="BULLETIN_PAIE">Bulletin de paie</option>
                            <option value="CIN">CNI</option>
                            <option value="CNAPS">CNPS</option>
                            <option value="OSTIE">OSTIE</option>
                            <option value="AUTRE">Autre</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            disabled={uploading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || !file}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {uploading ? 'Upload...' : 'Uploader'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Documents;