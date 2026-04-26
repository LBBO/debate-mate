import java.io.File
import org.apache.tools.ant.taskdefs.condition.Os
import org.gradle.api.DefaultTask
import org.gradle.api.GradleException
import org.gradle.api.logging.LogLevel
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

open class BuildTask : DefaultTask() {
    @Input
    var rootDirRel: String? = null
    @Input
    var target: String? = null
    @Input
    var release: Boolean? = null

    @TaskAction
    fun assemble() {
        val executable = resolveNodeExecutable()
        try {
            runTauriCli(executable)
        } catch (e: Exception) {
            if (Os.isFamily(Os.FAMILY_WINDOWS)) {
                // Try different Windows-specific extensions
                val fallbacks = listOf(
                    "$executable.exe",
                    "$executable.cmd",
                    "$executable.bat",
                )
                
                var lastException: Exception = e
                for (fallback in fallbacks) {
                    try {
                        runTauriCli(fallback)
                        return
                    } catch (fallbackException: Exception) {
                        lastException = fallbackException
                    }
                }
                throw lastException
            } else {
                throw e;
            }
        }
    }

    private fun resolveNodeExecutable(): String {
        val candidates = mutableListOf<String>()
        candidates.add("node")

        val nodeEnv = System.getenv("NODE")
        if (!nodeEnv.isNullOrBlank()) {
            candidates.add(nodeEnv)
        }

        val nvmBin = System.getenv("NVM_BIN")
        if (!nvmBin.isNullOrBlank()) {
            candidates.add("$nvmBin/node")
        }

        val home = System.getProperty("user.home")
        if (!home.isNullOrBlank()) {
            val nvmVersions = File("$home/.nvm/versions/node")
            if (nvmVersions.exists() && nvmVersions.isDirectory) {
                val latestNode = nvmVersions.listFiles()
                    ?.filter { it.isDirectory && it.name.startsWith("v") }
                    ?.maxByOrNull { it.name }
                if (latestNode != null) {
                    candidates.add("${latestNode.absolutePath}/bin/node")
                }
            }
        }

        return candidates.firstOrNull { it != "node" && File(it).exists() } ?: "node"
    }

    fun runTauriCli(executable: String) {
        val rootDirRel = rootDirRel ?: throw GradleException("rootDirRel cannot be null")
        val target = target ?: throw GradleException("target cannot be null")
        val release = release ?: throw GradleException("release cannot be null")
        val args = listOf("../node_modules/@tauri-apps/cli/tauri.js", "android", "android-studio-script");

        project.exec {
            workingDir(File(project.projectDir, rootDirRel))
            executable(executable)
            args(args)
            if (project.logger.isEnabled(LogLevel.DEBUG)) {
                args("-vv")
            } else if (project.logger.isEnabled(LogLevel.INFO)) {
                args("-v")
            }
            if (release) {
                args("--release")
            }
            args(listOf("--target", target))
        }.assertNormalExitValue()
    }
}