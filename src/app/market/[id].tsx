import { View, Modal, Alert, StatusBar, ScrollView } from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { useCameraPermissions, CameraView } from "expo-camera"

import { Button } from "@/components/buton";
import { Loading } from "@/components/loading";
import { Cover } from "../../components/market/cover";
import { Coupon } from "@/components/market/coupon";
import { Dateils, PropsDetails } from "@/components/market/details";

import { api } from "@/services/api";

type DataProps = PropsDetails & {
    cover: string
}

export default function Market() {

    const [data, setData] = useState<DataProps>()
    const [isLoading, setIsLoading] = useState(true)
    const [coupon, setCoupon] = useState<string | null>(null)
    const [couponIsFetching, setCouponIsFetching] = useState(false)
    const [isVisibleCameraModal, setIsVisivleCameraModal] = useState(false)

    const [_, requestPermission] = useCameraPermissions()
    const params = useLocalSearchParams<{ id: string }>()

    const qrLock = useRef(false)

    async function fetchMarket() {
        try {
            const { data } = await api.get(`/markets/${params.id}`)
            setData(data)
            setIsLoading(false)
        } catch (error) {
            console.log(error)
            Alert.alert("Error", "Não foi possivel carregar os dados", [{ text: "Ok", onPress: () => router.back() }])
        }
    }

    console.log(params.id)

    async function handlaOpenCamera() {
        try {
            const { granted } = await requestPermission()

            if (!granted) {
                return Alert.alert("Câmera", "Você precisa habilitar o uso da câmera.")
            }

            qrLock.current = false
            setIsVisivleCameraModal(true)
        } catch (error) {
            console.log(error)
            Alert.alert("Câmera", "Não foi possivel utilizar a câmera.")
        }
    }

    async function getCoupon(id: string) {
        try {
            setCouponIsFetching(true)

            const { data } = await api.patch("/coupons/" + id)
            Alert.alert("Cupom", data.coupon)
            setCoupon(data.coupon)
        } catch (error) {
            console.log(error)
            Alert.alert("Erro", "Não foi possivel utilizar o cupom")
        } finally {
            setCouponIsFetching(false)
        }
    }

    function handleUseCoupon(id: string) {
        setIsVisivleCameraModal(false)

        Alert.alert(
            "Cupon",
            "Não é possivel reutilizar um cupom resgatado. Deseja realmente resgatar o cupom ?",

            [
                { style: 'cancel', text: "Não" },
                { text: "Sim", onPress: () => getCoupon(id) }
            ]
        )
    }

    useEffect(() => {
        fetchMarket()
    }, [params.id, coupon])

    if (isLoading) {
        return <Loading />
    }

    if (!data) {
        return <Redirect href={"/home"}></Redirect>
    }

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle='light-content' hidden={isVisibleCameraModal} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <Cover uri={data.cover} />
                <Dateils data={data} />
                {coupon && <Coupon code={coupon} />}
            </ScrollView>
            <View style={{ padding: 32 }}>
                <Button onPress={handlaOpenCamera}>
                    <Button.Title>Ler QR Code</Button.Title>
                </Button>
            </View>

            <Modal style={{ flex: 1 }} visible={isVisibleCameraModal}>
                <CameraView style={{ flex: 1 }} facing="back" onBarcodeScanned={({ data }) => {
                    if (data && !qrLock.current) {
                        qrLock.current = true
                        setTimeout(() => handleUseCoupon(data), 500)
                    }
                }} />
                <View style={{ position: 'absolute', bottom: 32, left: 32, right: 32 }}>
                    <Button onPress={() => setIsVisivleCameraModal(false)} isloading={couponIsFetching}>
                        <Button.Title>
                            Voltar
                        </Button.Title>
                    </Button>
                </View>
            </Modal>
        </View>
    )
}