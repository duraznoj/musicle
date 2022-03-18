# Musicle

A Wordle-inspired game to guess popular musical phrases! 

The game is similar to Wordle, except that instead of guessing letters you guess musical notes on a staff. A key signature is provided on the staff as the single clue for your guesses, and the objective is to guess the five musical notes that form the introductory phrase to the melody of a popular song.

The song list is currently based on a subset of the "500 Greatest Songs of All Time" as ranked by Rolling Stone magazine. Melody data for this project is sourced from "A Corpus Study of Rock Music", which contains an archive of the song list (http://rockcorpus.midside.com/overview/rs500.txt). 


Sources:

1) This game uses the excellent VexFlow library created by Mohit Cheppudira (https://github.com/0xfe). VexFlow is available under the MIT License (https://github.com/0xfe/vexflow).

2) Melody data are adapted from the fantastic "A Corpus Study of Rock Music" melodic transcription database (http://rockcorpus.midside.com/melodic_transcriptions.html). From the website: "This website is the public portal for an ongoing, collaborative corpus based research project to study rock music, conducted by Trevor de Clercq [TdC] (trevor.declercq@gmail.com), David Temperley [DT] (dtemperley@esm.rochester.edu), Ethan Lustig, and Ivan Tan." I created a bash script to process the melodic transcription data to extract song names, introductory sequences of pitches, and key signatures from the transcriptions. The bash script uses the helpful perl script "process_mel5.pl" (http://rockcorpus.midside.com/programs.html#P2). The data and programs from the "A Corpus Study of Rock Music" are available for academic and commercial use under the terms of the CC BY 4.0 License (https://www.creativecommons.org/licenses/by/4.0/).

3) Game development was based in part on the wonderful Wordle JS tutorial video (https://www.youtube.com/watch?v=mpby4HiElek) from Ania Kubów (https://github.com/kubowania). The Wordle JS tutorial code is available for use under the MIT License (https://github.com/kubowania/wordle-javascript).

4) The note audio files were created by me.

Note: All URLs are linked at the time of writing on Mar 17, 2022 and may not be current.
