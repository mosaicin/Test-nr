"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function BirchGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameVersion, setGameVersion] = useState<"cathedral" | "realistic-pigs">("cathedral")
  const gameStateRef = useRef<any>(null)

  useEffect(() => {
    if (!gameStarted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Останавливаем предыдущую игру если она была
    if (gameStateRef.current?.animationFrameId) {
      cancelAnimationFrame(gameStateRef.current.animationFrameId)
    }

    // Adjust canvas size to match device width
    const resizeCanvas = () => {
      const parentWidth = canvas.parentElement?.clientWidth || window.innerWidth
      const scale = window.devicePixelRatio || 1

      canvas.width = parentWidth * scale
      canvas.height = 400 * scale

      canvas.style.width = `${parentWidth}px`
      canvas.style.height = "400px"

      ctx.scale(scale, scale)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Load background image for cathedral version
    const backgroundImg = new Image()
    backgroundImg.crossOrigin = "anonymous"
    backgroundImg.src = "/images/cathedral-background.jpg"

    // Game variables
    let animationFrameId: number
    let gameScore = 0
    let isGameOver = false

    // Birch tree character
    const birch = {
      x: 100,
      y: 300,
      width: 40,
      height: 80,
      velocity: 0,
      gravity: 0.8,
      jumpPower: -15,
      isJumping: false,
      trunkColor: "#FFFFFF",
      spotColor: "#333333",
      leafColor: "#AADDAA",
    }

    // Pigs and crows arrays
    const pigs: any[] = []
    const crows: any[] = []
    let crowTimer = 0
    const crowSpawnRate = 180
    let pigTimer = 0
    const pigSpawnRate = 120

    // Background elements
    const clouds: any[] = []
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * canvas.width,
        y: 50 + Math.random() * 100,
        width: 60 + Math.random() * 40,
        speed: 0.5 + Math.random() * 0.5,
      })
    }

    // Jump function
    const jump = () => {
      if (!birch.isJumping) {
        birch.velocity = birch.jumpPower
        birch.isJumping = true
      }
    }

    // Handle touch/click events
    const handleInteraction = (e: Event) => {
      e.preventDefault()
      jump()
    }

    canvas.addEventListener("click", handleInteraction)
    canvas.addEventListener("touchstart", handleInteraction)

    // Add a pig obstacle
    const addPig = () => {
      const pigHeight = 40 + Math.random() * 10
      pigs.push({
        x: canvas.width,
        y: 380 - pigHeight,
        width: 50,
        height: pigHeight,
        speed: -5 - Math.random() * 2,
        color: gameVersion === "realistic-pigs" ? "#D4A574" : "#F48FB1", // Более реалистичный цвет для свиней
      })
    }

    // Add a flying crow
    const addCrow = () => {
      crows.push({
        x: canvas.width,
        y: 100 + Math.random() * 150,
        width: 35,
        height: 25,
        speed: -3 - Math.random() * 2,
        wingPhase: Math.random() * Math.PI * 2,
        color: "#2C2C2C",
      })
    }

    // Draw realistic birch tree
    const drawBirch = () => {
      const trunkWidth = 10
      const trunkHeight = 60
      const trunkX = birch.x + birch.width / 2 - trunkWidth / 2
      const trunkY = birch.y + 20

      // Основной ствол (белый)
      ctx.fillStyle = birch.trunkColor
      ctx.fillRect(trunkX, trunkY, trunkWidth, trunkHeight)

      // Добавляем черные пятна на стволе
      ctx.fillStyle = birch.spotColor
      for (let i = 0; i < 6; i++) {
        const spotY = trunkY + 5 + i * 10
        const spotWidth = 2 + Math.random() * 3
        const spotHeight = 2 + Math.random() * 2
        ctx.fillRect(trunkX - 1, spotY, spotWidth, spotHeight)
        ctx.fillRect(trunkX + trunkWidth - spotWidth + 1, spotY + 3, spotWidth, spotHeight)
      }

      // Ветви
      ctx.strokeStyle = "#795548"
      ctx.lineWidth = 2
      ctx.lineCap = "round"

      ctx.beginPath()
      ctx.moveTo(trunkX, trunkY + 15)
      ctx.lineTo(trunkX - 15, trunkY - 5)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(trunkX + trunkWidth, trunkY + 15)
      ctx.lineTo(trunkX + trunkWidth + 15, trunkY - 5)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(trunkX - 8, trunkY + 5)
      ctx.lineTo(trunkX - 20, trunkY - 15)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(trunkX + trunkWidth + 8, trunkY + 5)
      ctx.lineTo(trunkX + trunkWidth + 20, trunkY - 15)
      ctx.stroke()

      // Листва
      ctx.fillStyle = birch.leafColor
      const drawLeafCluster = (x: number, y: number, size: number) => {
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2
          const distance = (Math.random() * size) / 2
          const leafX = x + Math.cos(angle) * distance
          const leafY = y + Math.sin(angle) * distance
          const leafSize = 2 + Math.random() * 3

          ctx.beginPath()
          ctx.ellipse(leafX, leafY, leafSize, leafSize * 1.5, angle, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      drawLeafCluster(trunkX - 15, trunkY - 5, 10)
      drawLeafCluster(trunkX + trunkWidth + 15, trunkY - 5, 10)
      drawLeafCluster(trunkX - 20, trunkY - 15, 12)
      drawLeafCluster(trunkX + trunkWidth + 20, trunkY - 15, 12)
      drawLeafCluster(trunkX - 10, trunkY - 10, 8)
      drawLeafCluster(trunkX + trunkWidth + 10, trunkY - 10, 8)
      drawLeafCluster(trunkX, trunkY - 5, 10)
      drawLeafCluster(trunkX + trunkWidth, trunkY - 5, 10)
    }

    // Draw realistic pig
    const drawRealisticPig = (pig: any) => {
      // Более реалистичная свинья на основе изображения

      // Тело (более серо-розовый цвет)
      ctx.fillStyle = "#D4A574" // Серо-бежевый цвет как на фото
      ctx.beginPath()
      ctx.ellipse(pig.x + pig.width / 2, pig.y + pig.height / 2, pig.width / 2, pig.height / 2, 0, 0, Math.PI * 2)
      ctx.fill()

      // Большие уши (как на фото)
      ctx.fillStyle = "#E8B896" // Светлее для внутренней части ушей
      ctx.beginPath()
      ctx.ellipse(pig.x + pig.width / 2 - 12, pig.y + 3, 10, 8, -0.3, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.ellipse(pig.x + pig.width / 2 + 12, pig.y + 3, 10, 8, 0.3, 0, Math.PI * 2)
      ctx.fill()

      // Внешняя часть ушей
      ctx.fillStyle = "#D4A574"
      ctx.beginPath()
      ctx.ellipse(pig.x + pig.width / 2 - 12, pig.y + 3, 8, 6, -0.3, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.ellipse(pig.x + pig.width / 2 + 12, pig.y + 3, 8, 6, 0.3, 0, Math.PI * 2)
      ctx.fill()

      // Большой розовый пятачок
      ctx.fillStyle = "#F4A6A6"
      ctx.beginPath()
      ctx.ellipse(pig.x + pig.width / 2, pig.y + pig.height / 2 + 8, 12, 10, 0, 0, Math.PI * 2)
      ctx.fill()

      // Ноздри
      ctx.fillStyle = "#8B4513"
      ctx.beginPath()
      ctx.ellipse(pig.x + pig.width / 2 - 4, pig.y + pig.height / 2 + 8, 2, 3, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.ellipse(pig.x + pig.width / 2 + 4, pig.y + pig.height / 2 + 8, 2, 3, 0, 0, Math.PI * 2)
      ctx.fill()

      // Большие выразительные глаза
      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.arc(pig.x + pig.width / 2 - 8, pig.y + pig.height / 2 - 8, 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(pig.x + pig.width / 2 + 8, pig.y + pig.height / 2 - 8, 5, 0, Math.PI * 2)
      ctx.fill()

      // Зрачки
      ctx.fillStyle = "#2E4057"
      ctx.beginPath()
      ctx.arc(pig.x + pig.width / 2 - 8, pig.y + pig.height / 2 - 8, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(pig.x + pig.width / 2 + 8, pig.y + pig.height / 2 - 8, 3, 0, Math.PI * 2)
      ctx.fill()

      // Блики в глазах
      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.arc(pig.x + pig.width / 2 - 7, pig.y + pig.height / 2 - 9, 1, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(pig.x + pig.width / 2 + 9, pig.y + pig.height / 2 - 9, 1, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw simple pig (original version)
    const drawSimplePig = (pig: any) => {
      ctx.fillStyle = pig.color

      // Body
      ctx.beginPath()
      ctx.ellipse(pig.x + pig.width / 2, pig.y + pig.height / 2, pig.width / 2, pig.height / 2, 0, 0, Math.PI * 2)
      ctx.fill()

      // Ears
      ctx.beginPath()
      ctx.ellipse(pig.x + pig.width / 2 - 10, pig.y + 5, 8, 5, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.ellipse(pig.x + pig.width / 2 + 10, pig.y + 5, 8, 5, 0, 0, Math.PI * 2)
      ctx.fill()

      // Snout
      ctx.fillStyle = "#F8BBD0"
      ctx.beginPath()
      ctx.ellipse(pig.x + pig.width / 2, pig.y + pig.height / 2 + 5, 10, 8, 0, 0, Math.PI * 2)
      ctx.fill()

      // Eyes
      ctx.fillStyle = "black"
      ctx.beginPath()
      ctx.arc(pig.x + pig.width / 2 - 8, pig.y + pig.height / 2 - 5, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(pig.x + pig.width / 2 + 8, pig.y + pig.height / 2 - 5, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw crow
    const drawCrow = (crow: any) => {
      const wingOffset = Math.sin(crow.wingPhase) * 5

      // Body
      ctx.fillStyle = crow.color
      ctx.beginPath()
      ctx.ellipse(crow.x + crow.width / 2, crow.y + crow.height / 2, crow.width / 3, crow.height / 3, 0, 0, Math.PI * 2)
      ctx.fill()

      // Head
      ctx.beginPath()
      ctx.arc(crow.x + crow.width - 8, crow.y + crow.height / 2 - 2, 8, 0, Math.PI * 2)
      ctx.fill()

      // Beak
      ctx.fillStyle = "#FFA500"
      ctx.beginPath()
      ctx.moveTo(crow.x + crow.width - 2, crow.y + crow.height / 2 - 2)
      ctx.lineTo(crow.x + crow.width + 5, crow.y + crow.height / 2 - 2)
      ctx.lineTo(crow.x + crow.width - 2, crow.y + crow.height / 2 + 2)
      ctx.closePath()
      ctx.fill()

      // Wings (animated)
      ctx.fillStyle = "#1C1C1C"

      ctx.beginPath()
      ctx.ellipse(crow.x + 8, crow.y + crow.height / 2 + wingOffset, 12, 6, -0.3, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.ellipse(crow.x + 8, crow.y + crow.height / 2 - wingOffset, 12, 6, 0.3, 0, Math.PI * 2)
      ctx.fill()

      // Eye
      ctx.fillStyle = "red"
      ctx.beginPath()
      ctx.arc(crow.x + crow.width - 6, crow.y + crow.height / 2 - 4, 2, 0, Math.PI * 2)
      ctx.fill()

      crow.wingPhase += 0.3
    }

    // Draw cathedral background
    const drawCathedralBackground = () => {
      if (backgroundImg.complete) {
        // Затемняем изображение и делаем его фоном
        ctx.globalAlpha = 0.3
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)
        ctx.globalAlpha = 1.0

        // Добавляем градиент сверху для лучшей видимости
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, "rgba(135, 206, 235, 0.8)")
        gradient.addColorStop(1, "rgba(135, 206, 235, 0.3)")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else {
        // Fallback если изображение не загрузилось
        ctx.fillStyle = "#87CEEB"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    // Draw simple background
    const drawSimpleBackground = () => {
      ctx.fillStyle = "#87CEEB"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Draw cloud
    const drawCloud = (cloud: any) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.beginPath()
      ctx.arc(cloud.x, cloud.y, cloud.width / 3, 0, Math.PI * 2)
      ctx.arc(cloud.x + cloud.width / 4, cloud.y - cloud.width / 6, cloud.width / 3, 0, Math.PI * 2)
      ctx.arc(cloud.x + cloud.width / 2, cloud.y, cloud.width / 3, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw ground
    const drawGround = () => {
      if (gameVersion === "cathedral") {
        // Мраморный пол для собора
        ctx.fillStyle = "#C0C0C0"
        ctx.fillRect(0, 380, canvas.width, 20)

        // Узор на полу
        ctx.fillStyle = "#A0A0A0"
        for (let i = 0; i < canvas.width; i += 40) {
          ctx.fillRect(i, 385, 20, 10)
        }
      } else {
        // Обычная земля
        ctx.fillStyle = "#8D6E63"
        ctx.fillRect(0, 380, canvas.width, 20)

        ctx.fillStyle = "#4CAF50"
        ctx.fillRect(0, 375, canvas.width, 5)
      }
    }

    // Check collision
    const checkCollision = (a: any, b: any) => {
      return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    }

    // Game loop
    const gameLoop = () => {
      if (isGameOver) {
        setGameOver(true)
        return
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background based on version
      if (gameVersion === "cathedral") {
        drawCathedralBackground()
      } else {
        drawSimpleBackground()
      }

      // Update and draw clouds (only for simple background)
      if (gameVersion !== "cathedral") {
        clouds.forEach((cloud) => {
          cloud.x -= cloud.speed
          if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width
            cloud.y = 50 + Math.random() * 100
          }
          drawCloud(cloud)
        })
      }

      // Update birch
      birch.velocity += birch.gravity
      birch.y += birch.velocity

      if (birch.y > 300) {
        birch.y = 300
        birch.velocity = 0
        birch.isJumping = false
      }

      drawBirch()

      // Update and draw pigs
      pigTimer++
      if (pigTimer > pigSpawnRate) {
        addPig()
        pigTimer = 0
      }

      for (let i = pigs.length - 1; i >= 0; i--) {
        const pig = pigs[i]
        pig.x += pig.speed

        // Draw pig based on version
        if (gameVersion === "realistic-pigs") {
          drawRealisticPig(pig)
        } else {
          drawSimplePig(pig)
        }

        if (checkCollision(birch, pig)) {
          isGameOver = true
        }

        if (pig.x + pig.width < 0) {
          pigs.splice(i, 1)
        }
      }

      // Update and draw crows
      crowTimer++
      if (crowTimer > crowSpawnRate) {
        addCrow()
        crowTimer = 0
      }

      for (let i = crows.length - 1; i >= 0; i--) {
        const crow = crows[i]
        crow.x += crow.speed
        drawCrow(crow)

        if (checkCollision(birch, crow)) {
          isGameOver = true
        }

        if (crow.x + crow.width < 0) {
          crows.splice(i, 1)
        }
      }

      // Draw ground
      drawGround()

      // Update score
      gameScore++
      setScore(Math.floor(gameScore / 10))

      // Draw score
      ctx.fillStyle = gameVersion === "cathedral" ? "white" : "black"
      ctx.font = "20px Arial"
      ctx.strokeStyle = gameVersion === "cathedral" ? "black" : "white"
      ctx.lineWidth = 2
      ctx.strokeText(`Счет: ${Math.floor(gameScore / 10)}`, 20, 30)
      ctx.fillText(`Счет: ${Math.floor(gameScore / 10)}`, 20, 30)

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    gameStateRef.current = { animationFrameId }
    gameLoop()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("click", handleInteraction)
      canvas.removeEventListener("touchstart", handleInteraction)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      pigs.length = 0
      crows.length = 0
    }
  }, [gameStarted, gameVersion])

  const startGame = (version: "cathedral" | "realistic-pigs") => {
    setGameVersion(version)
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
  }

  const restartGame = () => {
    if (gameStateRef.current?.animationFrameId) {
      cancelAnimationFrame(gameStateRef.current.animationFrameId)
    }

    setGameOver(false)
    setScore(0)
    setGameStarted(false)

    setTimeout(() => {
      setGameStarted(true)
    }, 100)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-100 to-green-100">
      <h1 className="text-3xl font-bold mb-4 text-center">Березка прыгает через свиней</h1>

      {!gameStarted && !gameOver ? (
        <Card className="p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-4">Выберите версию игры</h2>
          <p className="mb-4">Помогите березке перепрыгивать через свиней! Нажимайте на экран, чтобы прыгать.</p>
          <div className="space-y-3">
            <Button onClick={() => startGame("cathedral")} className="w-full">
              🏛️ Собор (красивый фон)
            </Button>
            <Button onClick={() => startGame("realistic-pigs")} variant="outline" className="w-full">
              🐷 Реалистичные свиньи
            </Button>
          </div>
        </Card>
      ) : (
        <div className="w-full max-w-2xl">
          <div className="mb-2 text-center">
            <span className="text-sm text-gray-600">
              Версия: {gameVersion === "cathedral" ? "🏛️ Собор" : "🐷 Реалистичные свиньи"}
            </span>
          </div>

          <div className="relative">
            <canvas ref={canvasRef} className="w-full border border-gray-300 rounded-lg shadow-lg" height="400" />

            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
                <div className="text-white text-center p-6">
                  <h2 className="text-2xl font-bold mb-2">Игра окончена!</h2>
                  <p className="text-xl mb-4">Ваш счет: {score}</p>
                  <div className="space-y-2">
                    <Button
                      onClick={restartGame}
                      variant="outline"
                      className="bg-white text-black hover:bg-gray-200 w-full"
                    >
                      Играть снова
                    </Button>
                    <Button
                      onClick={() => {
                        setGameStarted(false)
                        setGameOver(false)
                      }}
                      variant="outline"
                      className="bg-gray-200 text-black hover:bg-gray-300 w-full"
                    >
                      Выбрать другую версию
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!gameOver && (
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold">Нажмите на экран, чтобы прыгать</p>
              <p className="text-sm text-gray-600 mt-2">Текущий счет: {score}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
