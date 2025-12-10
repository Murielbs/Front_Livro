import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    FlatList, 
    TouchableOpacity, 
    StyleSheet,
    Alert,
    Modal,
    Button,
    Switch
} from 'react-native';

const API_BASE_URL = 'https://cautious-couscous-x5v5v9vq7gx636w5q-3000.app.github.dev/api/livros'; 

// --- Componente de Card de Livro ---
const LivroCard = ({ livro, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={() => onPress(livro)}>
        <Text style={styles.cardTitle}>{livro.titulo}</Text>
        <Text style={styles.cardAutor}>Autor: {livro.autor}</Text>
        <Text style={[styles.cardStatus, { color: livro.disponivel ? 'green' : 'red' }]}>
            {livro.disponivel ? 'Disponível' : 'Indisponível'}
        </Text>
    </TouchableOpacity>
);

// --- Componente Principal da Livraria ---
const LivrariaBRScreen = () => {
    const [livros, setLivros] = useState([]);
    const [busca, setBusca] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [formData, setFormData] = useState({ 
        id: null,
        titulo: '', 
        autor: '', 
        isbn: '', 
        anoPublicacao: '', 
        disponivel: true 
    });

    // Função para buscar os livros da API
    const fetchLivros = useCallback(async () => {
        try {
            const url = busca ? `${API_BASE_URL}?busca=${encodeURIComponent(busca)}` : API_BASE_URL;
            const response = await fetch(url);
            const data = await response.json();
            setLivros(data);
        } catch (error) {
            console.error("Erro ao buscar livros:", error);
            Alert.alert("Erro de Conexão", "Não foi possível conectar à Livraria BR. Verifique o endereço IP.");
        }
    }, [busca]);

    useEffect(() => {
        fetchLivros();
    }, [fetchLivros]);

    const openDetailsModal = (livro) => {
        setSelectedBook(livro);
        setModalVisible(true);
    };

    const closeDetailsModal = () => {
        setModalVisible(false);
        setSelectedBook(null);
    };
    
    const openFormModal = (livro = null) => {
        if (livro) {
            setFormData({ 
                id: livro.id,
                titulo: livro.titulo, 
                autor: livro.autor, 
                isbn: livro.isbn, 
                anoPublicacao: String(livro.anoPublicacao), 
                disponivel: livro.disponivel 
            });
        } else {
            setFormData({ 
                id: null,
                titulo: '', 
                autor: '', 
                isbn: '', 
                anoPublicacao: '', 
                disponivel: true 
            });
        }
        closeDetailsModal();
        setFormModalVisible(true);
    };

    const closeFormModal = () => {
        setFormModalVisible(false);
    };

    const handleFormSubmit = async () => {
        const isEditing = !!formData.id;
        const url = isEditing ? `${API_BASE_URL}/${formData.id}` : API_BASE_URL;
        const method = isEditing ? 'PUT' : 'POST';

        const dataToSend = {
            titulo: formData.titulo,
            autor: formData.autor,
            isbn: formData.isbn,
            anoPublicacao: parseInt(formData.anoPublicacao),
            disponivel: formData.disponivel
        };

        if (isNaN(dataToSend.anoPublicacao)) {
             Alert.alert("Erro", "O campo Ano de Publicação deve ser um número válido.");
             return;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });

            if (response.ok) {
                Alert.alert("Sucesso", `Livro ${isEditing ? 'atualizado' : 'adicionado'}!`);
                closeFormModal();
                fetchLivros();
            } else {
                const errorData = await response.json();
                Alert.alert("Erro", errorData.mensagem || "Ocorreu um erro na submissão.");
            }
        } catch (error) {
            console.error("Erro ao salvar livro:", error);
            Alert.alert("Erro de Rede", "Não foi possível salvar o livro.");
        }
    };

    const handleDelete = async () => {
        if (!selectedBook) return;

        Alert.alert(
            "Confirmação",
            `Tem certeza que deseja EXCLUIR o livro "${selectedBook.titulo}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_BASE_URL}/${selectedBook.id}`, {
                                method: 'DELETE'
                            });

                            if (response.status === 204) {
                                Alert.alert("Sucesso", "Livro excluído!");
                                closeDetailsModal();
                                fetchLivros();
                            } else {
                                Alert.alert("Erro", "Não foi possível excluir o livro.");
                            }
                        } catch (error) {
                            console.error("Erro ao excluir livro:", error);
                            Alert.alert("Erro de Rede", "Não foi possível excluir o livro.");
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Livraria BR</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => openFormModal(null)}>
                    <Text style={styles.addButtonText}>➕</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.searchBar}
                placeholder="Pesquisar Título, Autor ou ISBN..."
                value={busca}
                onChangeText={setBusca}
                onSubmitEditing={fetchLivros}
            />

            <FlatList
                data={livros}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <LivroCard livro={item} onPress={openDetailsModal} />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum livro encontrado.</Text>}
            />

            {selectedBook && (
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={closeDetailsModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.detailsModalContent}>
                            <Text style={styles.detailsTitle}>Detalhes do Livro</Text>
                            <Text style={styles.detailText}>**Título:** {selectedBook.titulo}</Text>
                            <Text style={styles.detailText}>**Autor:** {selectedBook.autor}</Text>
                            <Text style={styles.detailText}>**ISBN:** {selectedBook.isbn}</Text>
                            <Text style={styles.detailText}>**Ano:** {selectedBook.anoPublicacao}</Text>
                            <Text style={styles.detailText}>**Disponível:** {selectedBook.disponivel ? 'Sim' : 'Não'}</Text>

                            <View style={styles.detailsActions}>
                                <Button title="Editar" onPress={() => openFormModal(selectedBook)} color="#ffc107" />
                                <Button title="Excluir" onPress={handleDelete} color="#dc3545" />
                            </View>
                            <Button title="Fechar" onPress={closeDetailsModal} />
                        </View>
                    </View>
                </Modal>
            )}

            <Modal
                visible={formModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeFormModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.formModalContent}>
                        <Text style={styles.detailsTitle}>{formData.id ? 'Editar Livro' : 'Adicionar Novo Livro'}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Título"
                            value={formData.titulo}
                            onChangeText={(text) => setFormData({...formData, titulo: text})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Autor"
                            value={formData.autor}
                            onChangeText={(text) => setFormData({...formData, autor: text})}
                        />
                         <TextInput
                            style={styles.input}
                            placeholder="ISBN"
                            value={formData.isbn}
                            onChangeText={(text) => setFormData({...formData, isbn: text})}
                            keyboardType="default"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Ano de Publicação"
                            value={formData.anoPublicacao}
                            onChangeText={(text) => setFormData({...formData, anoPublicacao: text})}
                            keyboardType="numeric"
                        />
                        <View style={styles.switchContainer}>
                            <Text>Disponível:</Text>
                            <Switch
                                value={formData.disponivel}
                                onValueChange={(value) => setFormData({...formData, disponivel: value})}
                            />
                        </View>

                        <View style={styles.formActions}>
                            <Button title="Salvar" onPress={handleFormSubmit} />
                            <Button title="Cancelar" onPress={closeFormModal} color="#6c757d" />
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        backgroundColor: '#f4f4f9',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        backgroundColor: '#28a745',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    addButtonText: {
        color: 'white',
        fontSize: 20,
        lineHeight: 20,
    },
    searchBar: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginHorizontal: 20,
        marginBottom: 15,
        backgroundColor: 'white',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007bff',
    },
    cardAutor: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    cardStatus: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#777',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    detailsModalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'stretch',
    },
    detailsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    detailText: {
        fontSize: 16,
        marginBottom: 8,
    },
    detailsActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 15,
    },
    formModalContent: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    }
});

export default LivrariaBRScreen;
